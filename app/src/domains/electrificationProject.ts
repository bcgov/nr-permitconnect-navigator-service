import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import type {
  Contact,
  CurrentContext,
  ElectrificationProject,
  ElectrificationProjectBase,
  ElectrificationProjectIntake
} from '../types';
import { Initiative } from '../utils/enums/application';
import { toTitleCase } from '../utils';
import { confirmationTemplateElectrificationSubmission } from '../utils/templates';

import { ActivityContactRole, ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';
import { Repositories } from '../repository/unitOfWork';

import { email } from '../external/ches';
import { createActivity } from './activity';

/**
 * Generates and sends a templated email with the given data
 * @param projectWithContact Email data
 */
export async function emailProjectConfirmation(projectWithContact: ElectrificationProject & { contact: Contact }) {
  const configCC = config.get<string>('server.ches.submission.cc');
  const subject = 'Confirmation of Project Submission';

  const body = confirmationTemplateElectrificationSubmission({
    contactName:
      projectWithContact.contact?.firstName && projectWithContact.contact?.lastName
        ? `${projectWithContact.contact?.firstName} ${projectWithContact.contact?.lastName}`
        : '',
    initiative: toTitleCase(Initiative.ELECTRIFICATION),
    activityId: projectWithContact.activityId,
    projectId: projectWithContact.electrificationProjectId
  });

  const emailData = {
    from: configCC,
    to: [projectWithContact.contact.email!],
    cc: [configCC],
    subject: subject,
    bodyType: 'html',
    body: body
  };

  await email(emailData);
}

/**
 * Transforms intake data to match DB schema
 * @param repositories - The required repositories
 * @param data - Intake data
 * @param currentContext - The current context of the request
 * @returns Transformed project and permit data
 */
export const generateElectrificationProjectData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: ElectrificationProjectIntake,
  currentContext: CurrentContext
) => {
  let activityId = data.activityId;

  // Create activity and link contact if required
  if (!activityId) {
    activityId = (
      await createActivity(
        { activity: repositories.activity, initiative: repositories.initiative },
        Initiative.ELECTRIFICATION
      )
    )?.activityId;

    const contacts = await repositories.contact.search({ userId: [currentContext.userId!] });
    if (contacts[0]) {
      await repositories.activityContact.create({
        activityId,
        contactId: contacts[0].contactId,
        role: ActivityContactRole.PRIMARY
      });
    }
  }

  if (!activityId) throw new Error('Failed to generate activity ID');

  // Put new electrification project together
  const UUID = uuidv4();

  const electrificationProjectData: ElectrificationProjectBase = {
    companyIdRegistered: data.basic?.registeredId ?? null,
    companyNameRegistered: data.basic?.registeredName ?? null,
    projectName: data.basic?.projectName,
    projectDescription: data.basic?.projectDescription,
    bcHydroNumber: data.project?.bcHydroNumber ?? null,
    projectType: data.project?.projectType ?? null,
    electrificationProjectId: UUID,
    activityId: activityId,
    submittedAt: new Date(),
    submissionType: SubmissionType.GUIDANCE,
    applicationStatus: ApplicationStatus.NEW,
    aaiUpdated: false,
    addedToAts: false,
    projectCategory: null,
    locationDescription: null,
    hasEpa: null,
    megawatts: null,
    bcEnvironmentAssessNeeded: null,
    assignedUserId: null,
    astNotes: null,
    queuePriority: null,
    atsClientId: null,
    atsEnquiryId: null,
    createdBy: null,
    createdAt: null,
    updatedBy: null,
    updatedAt: null,
    deletedBy: null,
    deletedAt: null
  };

  return electrificationProjectData;
};
