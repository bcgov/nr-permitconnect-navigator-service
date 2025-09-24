// import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
// import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
// import { isTruthy } from '../utils/utils';
// import { Initiative } from '../utils/enums/application';
// import { getRecords } from '../services/permit';
import { parsePeachRecords } from '../parsers/peachRecordParser';
import { getPeachRecord } from '../services/peach';
import { searchPermits } from '../services/permit';
import { getSourceSystemKind } from '../services/sourceSystemKind';
// import { sourceSystemCodes } from '../utils/cache/codes';
import { PEACH_INTEGRATED_SYSTEMS } from '../utils/constants/permit';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Permit, PermitTracking, SourceSystemKind } from '../types';
import type { PeachRecord } from '../types/peachPies';

// function findPermitToTrack(
//   permitTracking: PermitTracking[],
//   systemToTrack: PeachItegratedSystems
// ): PermitTracking | undefined {
//   return permitTracking.find((pt) => pt.sourceSystemKind?.sourceSystem === systemToTrack);
// }

// function systemIsPeachIntegrated(sourceSystem: string) {
//   if (!sourceSystem) return false;
//   return PEACH_INTEGRATED_SYSTEMS.includes(sourceSystem as PeachItegratedSystems);
// }

export const syncPeachRecords = async (req: Request, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    const systemRecordPermits: { recordId: string; systemId: string; permit: Permit }[] = [];

    // Only fetch permits that have tracking with peach integrated systems
    const peachIntegratedPermits: Permit[] = await searchPermits(tx, {
      sourceSystems: PEACH_INTEGRATED_SYSTEMS,
      includePermitTracking: true
    });

    for (const permit of peachIntegratedPermits) {
      const permitTracking = permit.permitTracking;
      if (permitTracking && permitTracking.length > 1) {
        // TODO-PR do something else if result is greater than 1??
        // There shouldn't be more that 1 tracking id per system
        // Find correct one or do nothing?
      }
      if (permit.permitTracking?.[0]) {
        const recordId = permit.permitTracking[0].trackingId;
        const systemId = permit.permitTracking[0].sourceSystemKind?.sourceSystem;

        if (recordId && systemId)
          systemRecordPermits.push({
            recordId,
            systemId,
            permit: permit
          });
      }
    }

    const records: PeachRecord[] = await Promise.all(
      systemRecordPermits.map((srp) => getPeachRecord(srp.recordId, srp.systemId))
    );

    const parsedRecords = parsePeachRecords(records);

    for (let i = 0; i < systemRecordPermits.length; i++) {
      const systemRecordId = systemRecordPermits[i].systemId + systemRecordPermits[i].recordId;

      // TODO-PR compare values and push all new values into a permit object and send to db
      const decisionDatePeach = parsedRecords[systemRecordId].decisionDate;
      const stagePeach = parsedRecords[systemRecordId].stage;
      const statePeach = parsedRecords[systemRecordId].state;
      const statusChangeDatePeach = parsedRecords[systemRecordId].statusChangeDate;
      const submittedDatePeach = parsedRecords[systemRecordId].submittedDate;

      const decisionDatePcns = systemRecordPermits[i].permit.adjudicationDate;
      const stagePcns = systemRecordPermits[i].permit.stage;
      const statePcns = systemRecordPermits[i].permit.state;
      const statusChangeDatePcns = systemRecordPermits[i].permit.statusLastChanged;
      const submittedDatePcns = systemRecordPermits[i].permit.submittedDate;

      // TODO-PR make permit update service call
    }
  });
  res.status(204).end();
};
