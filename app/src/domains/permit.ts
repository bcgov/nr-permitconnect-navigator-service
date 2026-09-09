import config from 'config';
import { randomUUID } from 'node:crypto';

import { getProjectByActivityId } from './project';
import { codeTable } from '#src/db/codes/cache';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import { email } from '#src/external/ches';
import { formatDateOnly, toTitleCase } from '#src/utils/index';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';
import {
  initialPeachPermitUpdateTemplate,
  navPermitStatusUpdateTemplate,
  permitNoteUpdateTemplate
} from '#src/utils/templates';
import { state } from '../../state';

import type { Repositories } from '#src/db/unitOfWork';
import type { Permit, PermitCreateInput, PermitUpdateEmailParams, ProjectRepositoryKeys } from '#types';
import type { Initiative } from '#src/utils/enums/application';

/**
 * Builds a new permit record with default values for a freshly created permit
 * @param params - The identifying and varying fields of the permit
 * @returns A permit record ready for upsert
 */
export const buildNewPermitRecord = (params: {
  permitId: string;
  permitTypeId: number;
  activityId: string;
  stage: PermitStage;
  needed: PermitNeeded;
  state: PermitState;
  submittedDate?: Date | string | null;
  submittedTime?: string | null;
}): PermitCreateInput => ({
  permitId: params.permitId,
  permitTypeId: params.permitTypeId,
  activityId: params.activityId,
  stage: params.stage,
  needed: params.needed,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  issuedPermitId: null,
  state: params.state,
  onHoldCode: null,
  submittedDate: params.submittedDate ?? null,
  submittedTime: params.submittedTime ?? null,
  decisionDate: null,
  decisionTime: null,
  targetDate: null,
  targetDateDescription: null,
  technicalReviewer: null
});

/**
 * Retrieve permits and trackings that are PEACH integrated
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
 * @param repositories - The required repositories
 * @param params Email information for template and recipients
 */
export const sendPermitUpdateEmail = async (
  repositories: Pick<Repositories, 'permitType'>,
  params: PermitUpdateEmailParams
) => {
  const { permit, initiative, dearName, projectId, toEmails, emailTemplate } = params;
  const { permitId, activityId } = permit;

  let permitName = permit.permitType?.name;
  if (!permitName) {
    const permitType = await repositories.permitType.findFirst({
      select: { name: true },
      where: { permitTypeId: permit.permitTypeId }
    });
    permitName = permitType?.name;
  }

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
  let subject = `Updates for ${toTitleCase(initiative)} project ${activityId}, ${permitName}`;
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
  repositories: Pick<Repositories, ProjectRepositoryKeys | 'permitNote' | 'permitType' | 'user'>,
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
      const navigator = await repositories.user.findById(navigatorId);
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
    permitNoteId: randomUUID(),
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
    await sendPermitUpdateEmail({ permitType: repositories.permitType }, emailJob);
  }
};
