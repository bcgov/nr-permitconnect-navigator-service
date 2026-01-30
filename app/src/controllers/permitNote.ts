import { v4 as uuidv4 } from 'uuid';
import config from 'config';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { generateCreateStamps } from '../db/utils/utils.ts';
import { findPriorityPermitTracking } from './peach.ts';
import { searchElectrificationProjects } from '../services/electrificationProject.ts';
import { email } from '../services/email.ts';
import { searchHousingProjects } from '../services/housingProject.ts';
import { getPermit } from '../services/permit.ts';
import { getPeachRecord } from '../services/peach.ts';
import { createPermitNote } from '../services/permitNote.ts';
import { getSourceSystemKinds } from '../services/sourceSystemKind.ts';
import { Initiative } from '../utils/enums/application.ts';
import { PermitNeeded, PermitStage } from '../utils/enums/permit.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon';
import { peachPermitNoteNotificationTemplate, permitNoteNotificationTemplate } from '../utils/templates';
import { formatDateOnly, omit, readFeatureList, splitDateTime } from '../utils/utils.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type {
  ElectrificationProject,
  HousingProject,
  Permit,
  PermitNote,
  PermitTracking,
  SourceSystemKind
} from '../types/index.ts';

export const createPermitNoteController = async (req: Request<never, never, PermitNote>, res: Response) => {
  const response = await transactionWrapper<PermitNote>(async (tx: PrismaTransactionClient) => {
    const permitNoteResponse = await createPermitNote(tx, {
      ...req.body,
      permitNoteId: uuidv4(),
      ...generateCreateStamps(req.currentContext)
    });

    await emailPermitNoteConfirmation(tx, permitNoteResponse, req.currentContext.initiative!);

    return permitNoteResponse;
  });

  res.status(201).json(response);
};

async function emailPermitNoteConfirmation(tx: PrismaTransactionClient, permitNote: PermitNote, initiative: string) {
  const permit: Permit = await getPermit(tx, permitNote.permitId);

  if (permit.needed === PermitNeeded.YES || permit.stage !== PermitStage.PRE_SUBMISSION) {
    const configCC = config.get('server.ches.submission.cc') as string;

    let project: HousingProject | ElectrificationProject | undefined;
    let projectId: string | undefined;
    if (initiative === Initiative.HOUSING) {
      project = (await searchHousingProjects(tx, { activityId: [permit.activityId] }))[0];
      projectId = project?.housingProjectId;
    }
    if (initiative === Initiative.ELECTRIFICATION) {
      project = (await searchElectrificationProjects(tx, { activityId: [permit.activityId] }))[0];
      projectId = project?.electrificationProjectId;
    }

    const primaryContact = project?.activity?.activityContact?.find(
      (ac) => ac.role === ActivityContactRole.PRIMARY
    )?.contact;

    let usePeachTemplate = false;
    if (permit.permitTracking) {
      const peachUpdateNotePlaceholder =
        'You can now track your application progress here. You will receive an email if the status or stage changes, or when your Navigator posts an update.';
      const isOnlyTemplate = permitNote.note.trim() === peachUpdateNotePlaceholder;
      const isFirstNote = !permit?.permitNote?.length;
      const sourceSystemKinds = await getSourceSystemKinds(tx);
      const permitTracking: PermitTracking[] = permit.permitTracking.map((pt) => {
        const found =
          sourceSystemKinds.find((ssk) => ssk.sourceSystemKindId === pt.sourceSystemKindId) || ({} as SourceSystemKind);
        return {
          ...pt,
          sourceSystemKind: omit(found, ['permitTypeIds']) as SourceSystemKind
        };
      });
      const priorityPermitTracking = findPriorityPermitTracking(permitTracking);
      if (priorityPermitTracking?.trackingId && priorityPermitTracking.sourceSystemKind?.sourceSystem) {
        const peachRecord = await getPeachRecord(
          priorityPermitTracking.trackingId,
          priorityPermitTracking.sourceSystemKind.sourceSystem
        );
        if (peachRecord && isOnlyTemplate && isFirstNote && readFeatureList().peach) {
          usePeachTemplate = true;
        }
      }
    }

    let body;
    const emailTemplateData = {
      contactName: primaryContact?.firstName,
      activityId: project?.activityId,
      permitName: permit.permitType?.name,
      submittedDate: permit.submittedDate
        ? formatDateOnly(permit.submittedDate)
        : formatDateOnly(splitDateTime(permit.createdAt!).date),
      projectId: projectId,
      permitId: permit.permitId
    };
    if (usePeachTemplate) {
      body = peachPermitNoteNotificationTemplate(emailTemplateData);
    } else {
      body = permitNoteNotificationTemplate(emailTemplateData);
    }
    if (!primaryContact?.email) return;

    const emailData = {
      from: configCC,
      to: [primaryContact?.email],
      cc: [configCC],
      subject: `Updates for project ${project?.activityId}, ${permit.permitType?.name}`,
      bodyType: 'html',
      body: body
    };

    await email(emailData);
  }
}
