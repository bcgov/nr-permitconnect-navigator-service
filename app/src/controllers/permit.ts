import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { transactionWrapper } from '../db/utils/transactionWrapper';
import { generateCreateStamps, generateUpdateStamps } from '../db/utils/utils';
import { email } from '../services/email';
import { deletePermit, getPermit, getPermitTypes, listPermits, upsertPermit } from '../services/permit';
import { createPermitNote } from '../services/permitNote';
import { deleteManyPermitTracking, upsertPermitTracking } from '../services/permitTracking';
import { getProjectByActivityId } from '../services/project';
import { readUser } from '../services/user';
import { Initiative } from '../utils/enums/application';
import { permitNoteUpdateTemplate, permitStatusUpdateTemplate } from '../utils/templates';
import { formatDateOnly, isTruthy } from '../utils/utils';

import type { Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection';
import type { ListPermitsOptions, Permit, PermitTracking, PermitType, PermitUpdateEmailParams } from '../types';

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
 */
export const sendPermitUpdateEmail = async (params: PermitUpdateEmailParams) => {
  const { permit, initiative, dearName, projectId, toEmails, emailTemplate } = params;
  const { permitId, activityId } = permit;
  const permitName = permit.permitType?.name;
  const submittedDate = formatDateOnly(permit.submittedDate);

  const nrmPermitEmail = config.get('frontend.ches.submission.cc') as string;

  const emailBody = emailTemplate({
    activityId,
    dearName,
    initiative: initiative.toLowerCase(),
    permitId,
    permitName,
    projectId,
    submittedDate
  });

  const emailData = {
    to: toEmails,
    from: nrmPermitEmail,
    cc: [nrmPermitEmail],
    subject: `Updates for project ${activityId}, ${permitName}`,
    bodyType: 'html',
    body: emailBody
  };

  await email(emailData);
};

/**
 * Creates update notes and sends out email notifications for updated permits
 */
export const sendPermitUpdateNotifications = async (permits: Permit[]) => {
  const permitUpdateEmails: PermitUpdateEmailParams[] = [];
  await transactionWrapper<void>(async (tx: PrismaTransactionClient) => {
    for (const permit of permits) {
      const project = await getProjectByActivityId(tx, permit.activityId);

      const projectId =
        'electrificationProjectId' in project ? project.electrificationProjectId : project.housingProjectId;
      const contact = project.activity?.activityContact?.[0].contact;
      const initiative = project.activity!.initiative!.code as Initiative;
      const navigatorId = project.assignedUserId;

      // Add navigator update email to email jobs
      let navigatorName = 'Navigator';
      if (navigatorId) {
        const navigator = await readUser(tx, navigatorId);
        navigatorName = `${navigator?.firstName} ${navigator?.lastName}`;
      }
      const navEmail = config.get('server.pcns.navEmail') as string;

      permitUpdateEmails.push({
        permit,
        initiative,
        dearName: navigatorName,
        projectId,
        toEmails: [navEmail],
        emailTemplate: permitStatusUpdateTemplate
      });

      // Create update note for status change
      await createPermitNote(tx, {
        permitNoteId: uuidv4(),
        permitId: permit.permitId,
        note: `This application is ${permit.state.toLocaleLowerCase()} in the ${permit.stage.toLocaleLowerCase()}.`,
        ...generateCreateStamps(undefined),
        updatedBy: null,
        updatedAt: null,
        deletedBy: null,
        deletedAt: null
      });

      // Add proponent update email to email jobs
      const contactName = contact?.firstName ?? '';

      if (contact?.email) {
        permitUpdateEmails.push({
          permit,
          initiative,
          dearName: contactName,
          projectId,
          toEmails: [contact.email],
          emailTemplate: permitNoteUpdateTemplate
        });
      }
    }
  });

  // Send out permit update emails
  for (const emailJob of permitUpdateEmails) {
    await sendPermitUpdateEmail(emailJob);
  }
};

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
      permitTracking: undefined
    };

    const data = await upsertPermit(tx, permitUpsertData);
    await deleteManyPermitTracking(tx, permitData);
    await upsertPermitTracking(tx, permitData);
    return data;
  });
  res.status(200).json(response);
};
