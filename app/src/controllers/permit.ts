import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { findPriorityPermitTracking } from './peach.ts';
import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils.ts';
import { summarizePeachRecord } from '../parsers/peachParser.ts';
import { email } from '../services/email.ts';
import { getPeachRecord } from '../services/peach.ts';
import { deletePermit, getPermit, getPermitTypes, listPermits, upsertPermit } from '../services/permit.ts';
import { createPermitNote } from '../services/permitNote.ts';
import { deleteManyPermitTracking, upsertPermitTracking } from '../services/permitTracking.ts';
import { getProjectByActivityId } from '../services/project.ts';
import { getSourceSystemKinds } from '../services/sourceSystemKind.ts';
import { readUser } from '../services/user.ts';
import { Initiative } from '../utils/enums/application.ts';
import { PermitNeeded, PermitStage } from '../utils/enums/permit.ts';
import { ActivityContactRole } from '../utils/enums/projectCommon';
import {
  initialPeachPermitUpdateTemplate,
  navPermitStatusUpdateTemplate,
  permitNoteUpdateTemplate
} from '../utils/templates';
import { Problem } from '../utils/index.ts';
import { differential, formatDateOnly, isEmptyObject, isTruthy } from '../utils/utils.ts';
import { state } from '../../state.ts';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type {
  ListPermitsOptions,
  Permit,
  PermitTracking,
  PermitType,
  PermitUpdateEmailParams,
  SourceSystemKind
} from '../types/index.ts';

export const deletePermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    await deletePermit(tx, req.params.permitId);
  });
  res.status(204).end();
};

export const getPermitController = async (req: Request<{ permitId: string }>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    return await getPermit(tx, req.params.permitId);
  });
  res.status(200).json(response);
};

export const getPermitTypesController = async (
  req: Request<never, never, never, { initiative: Initiative }>,
  res: Response
) => {
  const response = await transactionWrapper<PermitType[]>(async (tx: PrismaTransactionClient) => {
    return await getPermitTypes(tx, req.query.initiative);
  });
  res.status(200).json(response);
};

export const listPermitsController = async (
  req: Request<never, never, never, Partial<ListPermitsOptions>>,
  res: Response
) => {
  const response = await transactionWrapper<Permit[]>(async (tx: PrismaTransactionClient) => {
    const options: ListPermitsOptions = {
      ...req.query,
      includeNotes: isTruthy(req.query.includeNotes)
    };

    return await listPermits(tx, options);
  });
  res.status(200).json(response);
};

/**
 * Sends out an email notification for the given update email params
 * @param params Email information for template and recipients
 */
export const sendPermitUpdateEmail = async (params: PermitUpdateEmailParams) => {
  const { permit, initiative, dearName, projectId, toEmails, emailTemplate } = params;
  const { permitId, activityId } = permit;
  const permitName = permit.permitType?.name;
  const submittedDate = formatDateOnly(permit.submittedDate);

  const nrmPermitEmail: string = config.get('server.ches.submission.cc');

  const emailBody = emailTemplate({
    activityId,
    dearName,
    initiative: initiative.toLowerCase(),
    permitId,
    permitName,
    projectId,
    submittedDate
  });

  const appEnv = config.get('server.env');
  let subject = `Updates for project ${activityId}, ${permitName}`;
  if (appEnv === 'dev' || appEnv === 'test') subject = `TEST -- ${subject} -- TEST`;

  const emailData = {
    to: toEmails,
    from: nrmPermitEmail,
    cc: [nrmPermitEmail],
    subject: subject,
    bodyType: 'html',
    body: emailBody
  };

  await email(emailData);
};

/**
 * Creates update notes and sends out email notifications for updated permits
 * @param permit Permit to send notifications for
 * @param fromPeachSync Indicates if the update is coming from a PEACH sync
 * @param note A permit note to be used in permit note creation, if given
 * @param tx Optional Prisma transaction client - Use the existing transaction if provided, otherwise create a new one
 */
export const sendPermitUpdateNotifications = async (
  permit: Permit,
  fromPeachSync: boolean,
  note?: string,
  tx?: PrismaTransactionClient
) => {
  const permitUpdateEmails: PermitUpdateEmailParams[] = [];

  const createNoteAndDraftEmails = async (tx: PrismaTransactionClient) => {
    const project = await getProjectByActivityId(tx, permit.activityId);

    const initiative = project.activity!.initiative!.code as Initiative;

    if (fromPeachSync) {
      const navigatorId = project.assignedUserId;

      // Add navigator update email to email jobs
      let navigatorName = 'Navigator';
      if (navigatorId) {
        const navigator = await readUser(tx, navigatorId);
        navigatorName = `${navigator?.firstName} ${navigator?.lastName}`;
      }
      const navEmail: string = config.get('server.pcns.navEmail');
      if (project.projectId)
        permitUpdateEmails.push({
          permit,
          initiative,
          dearName: navigatorName,
          projectId: project.projectId,
          toEmails: [navEmail],
          emailTemplate: navPermitStatusUpdateTemplate
        });
    }

    // Create update note for status change
    const permitNote = await createPermitNote(tx, {
      permitNoteId: uuidv4(),
      permitId: permit.permitId,
      note:
        note ?? `This application is ${permit.state.toLocaleLowerCase()} in the ${permit.stage.toLocaleLowerCase()}.`,
      ...generateCreateStamps(undefined),
      updatedBy: null,
      updatedAt: null,
      deletedBy: null,
      deletedAt: null
    });
    // Add proponent update email to email jobs
    const primaryContact = project?.activity?.activityContact?.find(
      (ac) => ac.role === ActivityContactRole.PRIMARY
    )?.contact;

    const peachUpdateNotePlaceholder =
      'You can now track your application progress here. You will receive an email if the status or stage changes, ' +
      'or when your Navigator posts an update.';
    const isOnlyTemplate = permitNote.note.trim() === peachUpdateNotePlaceholder;
    const isFirstNote = !permit?.permitNote?.length;

    const usePeachTemplate = isOnlyTemplate && isFirstNote && state.features.peach;

    if (
      project.projectId &&
      primaryContact?.email &&
      (permit.needed === PermitNeeded.YES || permit.stage !== PermitStage.PRE_SUBMISSION)
    ) {
      permitUpdateEmails.push({
        permit,
        initiative,
        dearName: primaryContact?.firstName ?? '',
        projectId: project.projectId,
        toEmails: [primaryContact.email],
        emailTemplate: usePeachTemplate ? initialPeachPermitUpdateTemplate : permitNoteUpdateTemplate
      });
    }
  };

  if (tx) {
    await createNoteAndDraftEmails(tx);
  } else {
    await transactionWrapper<void>(createNoteAndDraftEmails);
  }

  // Send out permit update emails
  for (const emailJob of permitUpdateEmails) {
    await sendPermitUpdateEmail(emailJob);
  }
};

function checkIfPeachIntegratedAuthType(sourceSystem: string, sourceSystemKinds: SourceSystemKind[]): boolean {
  const sourceSystemKind = sourceSystemKinds.find((ssk) => ssk.integrated && ssk.sourceSystem === sourceSystem);
  return !!sourceSystemKind;
}

const snapshotPermitStatus = (p: Partial<Permit>) => ({
  state: p.state,
  stage: p.stage,
  decisionDate: p.decisionDate,
  submittedDate: p.submittedDate,
  statusLastChanged: p.statusLastChanged
});

export const upsertPermitController = async (req: Request<never, never, Permit>, res: Response) => {
  const response = await transactionWrapper<Permit>(async (tx: PrismaTransactionClient) => {
    const createStamps = generateCreateStamps(req.currentContext);
    const updateStamps = generateUpdateStamps(req.currentContext);

    // Add permit ID and stamp data if necessary
    const permitData: Permit = {
      ...req.body,
      permitId: req.body.permitId || uuidv4(),
      createdAt: req.body.createdAt ?? createStamps.createdAt,
      createdBy: req.body.createdBy ?? createStamps.createdBy,
      ...updateStamps
    };

    const { permitType, permitNote, ...permit } = req.body;
    const sourceSystemKinds = await getSourceSystemKinds(tx);
    const isPeachIntegratedAuth = checkIfPeachIntegratedAuthType(permitType?.sourceSystem ?? '', sourceSystemKinds);
    const peachIntegratedTracking = findPriorityPermitTracking(permit.permitTracking);
    let isValidPeachPermit = false;

    if (isPeachIntegratedAuth && !!peachIntegratedTracking) {
      const peachRecord = await getPeachRecord(
        peachIntegratedTracking.trackingId!,
        peachIntegratedTracking.sourceSystemKind!.sourceSystem
      );
      const peachSummary = summarizePeachRecord(peachRecord);
      isValidPeachPermit = !!peachSummary;
      if (!isValidPeachPermit) throw new Problem(400, { detail: 'Invalid Peach record summary' });
    }

    // Add data to tracking IDs if necessary
    permitData.permitTracking?.forEach((x: PermitTracking) => {
      x.permitId = x.permitId ?? permitData.permitId;
      x.shownToProponent = x.shownToProponent ?? false;

      if (x.createdAt && x.createdBy) {
        x.updatedAt = updateStamps.updatedAt;
        x.updatedBy = updateStamps.updatedBy;
      } else {
        x.createdAt = createStamps.createdAt;
        x.createdBy = createStamps.createdBy;
      }
    });

    // Upserting can't have relational information in the data
    const permitUpsertData: Permit = {
      ...permitData,
      permitNote: undefined,
      permitTracking: undefined,
      permitType: undefined
    };

    const oldAuthorization = permit.permitId ? await getPermit(tx, permit.permitId) : undefined;
    const data = await upsertPermit(tx, permitUpsertData);
    await deleteManyPermitTracking(tx, permitData);
    await upsertPermitTracking(tx, permitData);

    const before = snapshotPermitStatus(oldAuthorization ?? {});
    const after = snapshotPermitStatus(data);
    const diff = differential(before, after);

    const statusChanged = !isEmptyObject(diff);
    const permitNoteText = (permitNote?.[0].note ?? '').trim();
    const isEmptyPermitNote = permitNoteText.length === 0;

    // Prevent creating notes and sending an update email if the above call fails
    if (data?.permitId) {
      if (!isEmptyPermitNote || (isValidPeachPermit && statusChanged)) {
        const note = isEmptyPermitNote
          ? `This application is ${data.state.toLocaleLowerCase()} in the ${data.stage.toLocaleLowerCase()}.`
          : permitNoteText;
        await sendPermitUpdateNotifications(data, false, note, tx);
      }
    }

    return data;
  });
  res.status(200).json(response);
};
