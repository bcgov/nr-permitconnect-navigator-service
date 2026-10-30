import config from 'config';
import { randomUUID } from 'node:crypto';

import { getProjectByActivityId } from './project.ts';
import { codeTable } from '#src/db/codes/cache';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import { formatDateOnly, toTitleCase } from '#src/utils/index';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';
import Problem from '#src/utils/problem';
import {
  initialPeachPermitUpdateTemplate,
  intakePermitNotificationTemplate,
  navPermitStatusUpdateTemplate,
  permitNoteUpdateTemplate
} from '#src/utils/templates';
import { state } from '../../state.ts';

import type { Repositories } from '#src/db/unitOfWork';
import type {
  Contact,
  CurrentContext,
  Email,
  Permit,
  PermitCreateInput,
  PermitUpdateEmailParams,
  ProjectRepositoryKeys
} from '#types';
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
  consultationStartDate: null,
  consultationStartTime: null,
  consultationEndDate: null,
  consultationEndTime: null,
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
 * Builds the email content for a permit update notification, does not send it
 * @param repositories - The required repositories
 * @param params Email information for template and recipients
 * @returns The email ready to be sent
 */
export const buildPermitUpdateEmail = async (
  repositories: Pick<Repositories, 'permitType'>,
  params: PermitUpdateEmailParams
): Promise<Email> => {
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

  return {
    to: toEmails,
    from: nrmPermitEmail,
    cc: [nrmPermitEmail],
    subject: subject,
    bodyType: 'html',
    body: emailBody
  };
};

/**
 * Creates the update note and builds email notifications for an updated permit, does not send them
 * @param repositories - The required repositories
 * @param permit Permit to prepare notifications for
 * @param fromPeachSync Indicates if the update is coming from a PEACH sync
 * @param note A permit note to be used in permit note creation, if given
 * @returns The emails ready to be sent
 */
export const prepareNotificationEmails = async (
  repositories: Pick<Repositories, ProjectRepositoryKeys | 'permitNote' | 'permitType' | 'user'>,
  permit: Permit,
  fromPeachSync: boolean,
  note?: string
): Promise<Email[]> => {
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

  // Build permit update emails, caller sends them once outside of the db transaction
  return await Promise.all(
    permitUpdateEmails.map((emailJob) => buildPermitUpdateEmail({ permitType: repositories.permitType }, emailJob))
  );
};

/**
 * Builds the email content for an intake notification listing newly submitted permits, does not send it
 * @param repositories - The required repositories
 * @param permits The submitted permits to list, all belonging to the same activity
 * @param contact Contact record of the proponent who submitted the permits
 * @returns The email ready to be sent
 */
async function buildIntakeNotificationEmail(
  repositories: Pick<Repositories, ProjectRepositoryKeys | 'permitType' | 'user'>,
  permits: Permit[],
  contact: Contact
): Promise<Email> {
  const firstPermit = permits[0];
  if (!firstPermit) {
    throw new Error('Cannot send intake permit notification without permits');
  }
  if (!firstPermit.createdAt) {
    throw new Error(`Permit ${firstPermit.permitId} is missing its creation date`);
  }

  const project = await getProjectByActivityId(
    {
      electrificationProject: repositories.electrificationProject,
      generalProject: repositories.generalProject,
      housingProject: repositories.housingProject
    },
    firstPermit.activityId
  );

  const initiative = (project.activity!.initiative!.code as Initiative).toLowerCase();

  const navigatorId = project.assignedUserId;

  // Add navigator update email to email jobs
  let dearName = 'Navigator team';
  const pcnsEmail: string = config.get('server.pcns.navEmail');
  let navigatorEmail: string | undefined;
  if (navigatorId) {
    const navigator = await repositories.user.findById(navigatorId);
    if (navigator) {
      dearName = `${navigator.firstName} ${navigator.lastName}`;
      navigatorEmail = navigator.email!;
    }
  }

  const appUrl = config.get<string>('server.pcns.appUrl');
  const permitTypeIds = Array.from(new Set(permits.map((permit) => permit.permitTypeId)));
  const permitTypes = await repositories.permitType.findMany({
    where: { permitTypeId: { in: permitTypeIds } }
  });
  const permitTypeById = new Map(permitTypes.map((permitType) => [permitType.permitTypeId, permitType]));

  const permitLinks = permits.map((permit) => {
    const permitType = permitTypeById.get(permit.permitTypeId);
    if (!permitType) {
      throw new Error(`Permit type ${permit.permitTypeId} not found`);
    }

    const href = `${appUrl}/i/${initiative}/project/${project.projectId}/authorization/${permit.permitId}`;
    const label = `${permitType.businessDomain}: ${permitType.name}`;
    return { href, label };
  });

  const submittedPermits = permitLinks.map(({ href, label }) => `<a href="${href}">${label}</a>`).join(', ');

  const emailBody = intakePermitNotificationTemplate({
    dearName,
    projectName: project.projectName,
    activityId: project.activityId,
    proponentName: contact.firstName,
    relationshipToProject: contact.contactApplicantRelationship,
    newPermitsCount: permits.length.toString(),
    projectId: project.projectId,
    submittedPermits: submittedPermits,
    submittedDate: formatDateOnly(firstPermit.createdAt.toLocaleDateString('en-CA', { timeZone: 'America/Vancouver' }))
  });

  const appEnv = config.get('server.env');
  let subject = `New ${toTitleCase(initiative)} permits have been submitted`;
  if (appEnv === 'dev' || appEnv === 'test') subject = `TEST -- ${subject} -- TEST`;

  const emailData = {
    to: [navigatorEmail ?? pcnsEmail],
    from: pcnsEmail,
    subject: subject,
    bodyType: 'html',
    body: emailBody
  };

  return emailData;
}

/**
 * Builds one intake notification email per activity for the submitted permits, does not send them
 * @param repositories - The required repositories
 * @param currentContext The context of the proponent submitting the permits
 * @param permits The submitted permits, grouped into one email per activity
 * @returns The emails ready to be sent
 * @throws {Problem} 403 if the current user does not have an associated contact record
 */
export const prepareIntakeNotificationEmails = async (
  repositories: Pick<Repositories, ProjectRepositoryKeys | 'contact' | 'permitType' | 'user'>,
  currentContext: CurrentContext,
  permits: Permit[]
): Promise<Email[]> => {
  const contactRecord = await repositories.contact.findFirst({
    where: {
      userId: currentContext.userId!
    }
  });

  if (!contactRecord)
    throw new Problem(403, {
      detail: 'User does not have an associated contact record'
    });
  const permitsByProject: Record<string, Permit[]> = {};
  for (const permit of permits) {
    if (!permitsByProject[permit.activityId]) {
      permitsByProject[permit.activityId] = [];
    }
    permitsByProject[permit.activityId].push(permit);
  }

  const emailDataArray = await Promise.all(
    Object.values(permitsByProject).map((projectPermits) =>
      buildIntakeNotificationEmail(repositories, projectPermits, contactRecord)
    )
  );

  return emailDataArray;
};
