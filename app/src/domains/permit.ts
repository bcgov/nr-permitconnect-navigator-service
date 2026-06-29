import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { email } from '../external/ches';
import { Repositories } from '../repository/unitOfWork';
import { formatDateOnly } from '../utils';

import type { Permit, PermitUpdateEmailParams } from '../types';
import { getProjectByActivityId } from './project';
import { Initiative } from '../utils/enums/application';
import {
  initialPeachPermitUpdateTemplate,
  navPermitStatusUpdateTemplate,
  permitNoteUpdateTemplate
} from '../utils/templates';
import { codeTable } from '../db/codes/cache';
import { ActivityContactRole } from '../utils/enums/projectCommon';
import { state } from '../../state';
import { PermitNeeded } from '../utils/enums/permit';
import { PermitStage } from '../db/codes/enums';

/**
 * Retrieve permits and trackers that are PEACH integrated
 * @param repositories - The required repositories
 * @returns A Promise that resolves to a list of permits matching the search params
 */
export const listPeachIntegratedTrackings = async (repositories: Pick<Repositories, 'permit'>): Promise<Permit[]> => {
  return await repositories.permit.findMany({
    where: {
      AND: [{ permitTracking: { some: { sourceSystemKind: { integrated: true } } } }]
    },
    include: {
      permitTracking: {
        where: { AND: [{ sourceSystemKind: { integrated: true } }] },
        include: { sourceSystemKind: true }
      }
    }
  });
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
 * @param repositories - The required repositories
 * @param permit Permit to send notifications for
 * @param fromPeachSync Indicates if the update is coming from a PEACH sync
 * @param note A permit note to be used in permit note creation, if given
 */
export const sendPermitUpdateNotifications = async (
  repositories: Pick<
    Repositories,
    'electrificationProject' | 'generalProject' | 'housingProject' | 'permitNote' | 'user'
  >,
  permit: Permit,
  fromPeachSync: boolean,
  note?: string
) => {
  const permitUpdateEmails: PermitUpdateEmailParams[] = [];

  const project = await getProjectByActivityId(
    {
      electrificationProject: repositories.electrificationProject,
      generalProject: repositories.generalProject,
      housingProject: repositories.housingProject
    },
    permit.activityId
  );

  const initiative = project.activity!.initiative!.code as Initiative;

  if (fromPeachSync) {
    const navigatorId = project.assignedUserId;

    // Add navigator update email to email jobs
    let navigatorName = 'Navigator';
    if (navigatorId) {
      const navigator = await repositories.user.findUnique({
        where: {
          userId: navigatorId
        }
      });
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

  const stateDisplay = codeTable.PermitState.displays[permit.state];
  const stageDisplay = codeTable.PermitStage.displays[permit.stage];

  if (!stateDisplay || !stageDisplay) {
    throw new Error(`Invalid permit.state: ${permit.state} or permit.stage: ${permit.stage}`);
  }

  // Create update note for status change
  const permitNoteRes = await repositories.permitNote.create({
    permitNoteId: uuidv4(),
    permitId: permit.permitId,
    note: note ?? `This application is ${stateDisplay.toLocaleLowerCase()} in the ${stageDisplay.toLocaleLowerCase()}.`
  });

  // Add proponent update email to email jobs
  const primaryContact = project?.activity?.activityContact?.find(
    (ac) => ac.role === ActivityContactRole.PRIMARY
  )?.contact;

  const peachUpdateNotePlaceholder =
    'You can now track your application progress here. You will receive an email if the status or stage changes, ' +
    'or when your Navigator posts an update.';
  const isOnlyTemplate = permitNoteRes.note.trim() === peachUpdateNotePlaceholder;
  const isFirstNote = !permit?.permitNote?.length;

  const useInitialPeachTemplate = isOnlyTemplate && isFirstNote && state.features.peach;

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
      emailTemplate: useInitialPeachTemplate ? initialPeachPermitUpdateTemplate : permitNoteUpdateTemplate
    });
  }

  // Send out permit update emails
  for (const emailJob of permitUpdateEmails) {
    await sendPermitUpdateEmail(emailJob);
  }
};
