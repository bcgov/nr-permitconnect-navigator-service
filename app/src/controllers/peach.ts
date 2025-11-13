import { getLogger } from '../components/log';
import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateUpdateStamps } from '../db/utils/utils';
import { parsePeachRecords } from '../parsers/peachParser';
import { getPeachRecord } from '../services/peach';
import { searchPermits, upsertPermit } from '../services/permit';
import { compareDates } from '../utils';
import { PEACH_INTEGRATED_SYSTEMS } from '../utils/constants/permit';
import { PeachIntegratedSystem } from '../utils/enums/permit';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { PeachSummary, Permit, Record as PeachRecord } from '../types';

const log = getLogger(module.filename);

export const getPeachRecordController = async (req: Request<{ recordId: string; systemId: string }>, res: Response) => {
  const response = await getPeachRecord(req.params.recordId, req.params.systemId);

  res.status(200).json(response);
};

export const syncPeachRecords = async () => {
  const systemRecordPermits: { recordId: string; systemId: string; permit: Permit }[] = [];
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    // Only fetch permits that have tracking with peach integrated systems
    const peachIntegratedPermits: Permit[] = await searchPermits(tx, {
      sourceSystems: PEACH_INTEGRATED_SYSTEMS,
      includePermitTracking: true
    });

    // Find permits that have a permit tracking from the vFCBC system
    for (const permit of peachIntegratedPermits) {
      const permitTrackings = permit.permitTracking ?? [];

      if (permitTrackings.length === 0) continue;

      // TODO-RELEASE: Ensure that we only going with vFCBC tracking ids
      // For now just grabbing status info from vFCBC system but may need code below if things change
      // Filter out trackings that aren't peach integrated
      // const integratedTrackings = permitTrackings.filter((pt) =>
      //   PEACH_INTEGRATED_SYSTEMS.includes(pt.sourceSystemKind?.sourceSystem as PeachIntegratedSystem)
      // );
      // // Prioritize certain systems over other and get the tracked permit
      // const permitTracking =
      //   integratedTrackings.find((it) => {
      //     const sourceSystem = it.sourceSystemKind?.sourceSystem as PeachIntegratedSystem | undefined;
      //     return sourceSystem === PeachIntegratedSystem.ATS || sourceSystem === PeachIntegratedSystem.WMA;
      //   }) ?? integratedTrackings[0];

      const permitTracking = permitTrackings.find((it) => {
        const sourceSystem = it.sourceSystemKind?.sourceSystem as PeachIntegratedSystem | undefined;
        return sourceSystem === PeachIntegratedSystem.VFCBC;
      });

      if (!permitTracking) continue;

      const recordId = permitTracking.trackingId;
      const systemId = permitTracking.sourceSystemKind?.sourceSystem;

      if (recordId && systemId)
        systemRecordPermits.push({
          recordId,
          systemId,
          permit: permit
        });
    }
  });

  const results = await Promise.allSettled(
    systemRecordPermits.map((srp) => getPeachRecord(srp.recordId, srp.systemId))
  );

  const records: PeachRecord[] = [];
  const failures: { index: number; reason: unknown }[] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') records.push(r.value);
    else failures.push({ index: i, reason: r.reason });
  });

  log.info('PEACH fetch summary', {
    total: results.length,
    fetched: records.length,
    failed: failures.length
  });

  if (failures.length) {
    for (const f of failures) {
      const { recordId, systemId } = systemRecordPermits[f.index];
      log.warn('PEACH fetch failed', { recordId, systemId, error: f.reason });
    }
  }

  const parsedRecords: Record<string, PeachSummary> = parsePeachRecords(records);

  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    for (let i = 0; i < systemRecordPermits.length; i++) {
      const { recordId, systemId, permit: pcnsPermit } = systemRecordPermits[i];
      const systemRecordId = systemId + recordId;
      const peachPermit = parsedRecords[systemRecordId];

      if (!peachPermit) continue;

      // If parser didn't return proper status mappings skip upsert
      if (peachPermit.stage === undefined || peachPermit.state === undefined) {
        continue;
      }

      const submittedDatesEqual =
        compareDates(peachPermit.submittedDate ?? undefined, pcnsPermit.submittedDate ?? undefined) === 0;
      const ajudicationDatesEqual =
        compareDates(peachPermit.adjudicationDate ?? undefined, pcnsPermit.adjudicationDate ?? undefined) === 0;
      const lastChangedDatesEqual =
        compareDates(peachPermit.statusLastChanged ?? undefined, pcnsPermit.statusLastChanged ?? undefined) === 0;
      const statesEqual = peachPermit.state === pcnsPermit.state;
      const stagesEqual = peachPermit.stage === pcnsPermit.stage;

      const hasDiff =
        !stagesEqual || !statesEqual || !submittedDatesEqual || !ajudicationDatesEqual || !lastChangedDatesEqual;

      if (!hasDiff) continue;

      if (peachPermit.state) pcnsPermit.state = peachPermit.state;
      if (peachPermit.stage) pcnsPermit.stage = peachPermit.stage;
      if (peachPermit.submittedDate) pcnsPermit.submittedDate = peachPermit.submittedDate;
      if (peachPermit.adjudicationDate) pcnsPermit.adjudicationDate = peachPermit.adjudicationDate;
      if (peachPermit.statusLastChanged) {
        pcnsPermit.statusLastChanged = peachPermit.statusLastChanged;
        pcnsPermit.statusLastVerified = peachPermit.statusLastChanged;
      }

      const { updatedBy, updatedAt } = generateUpdateStamps(undefined);
      pcnsPermit.updatedAt = updatedAt;
      pcnsPermit.updatedBy = updatedBy;

      await upsertPermit(tx, pcnsPermit);
    }
  });
};
