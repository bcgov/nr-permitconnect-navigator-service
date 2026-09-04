import config from 'config';
import { randomUUID } from 'node:crypto';

import { ensureActivityWithPrimaryContact } from './activity';
import { getProjectByActivityId } from './project';
import { email } from '#src/external/ches';
import { getCurrentUsername, toTitleCase } from '#src/utils/index';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';
import { confirmationTemplateEnquiry } from '#src/utils/templates';

import type { Repositories } from '#src/db/unitOfWork';
import type { ContactBase, CreateEnquiryInput, CurrentContext, Enquiry, ProjectRepositoryKeys } from '#types';
import type { Initiative } from '#src/utils/enums/application';

export async function emailEnquiryConfirmation(
  repositories: Pick<Repositories, ProjectRepositoryKeys>,
  enquiryWithContact: Enquiry & { contact: ContactBase },
  initiative: Initiative,
  relatedActivityId?: string
) {
  const configCC = config.get<string>('server.ches.submission.cc');

  let permitDescription = '';
  let enquiryDescription: string = enquiryWithContact.enquiryDescription || '';
  let firstTwoSentences: string;

  // If has permit description convert \n to <br>
  if (enquiryDescription.includes('Tracking ID:')) {
    const descriptionSplit = enquiryDescription.split('\n\n');
    permitDescription = descriptionSplit[0]?.replaceAll(/\n/g, '<br>') + '<br><br>';
    enquiryDescription = descriptionSplit.slice(1, descriptionSplit.length).join(' ');
  }

  // Get the first two sentences of the enquiry description using proper sentence segmentation
  // If there are more than two sentences in enquiryDescription, add '..' to the end
  const segmenter = new Intl.Segmenter('en', { granularity: 'sentence' });
  const segments = Array.from(segmenter.segment(enquiryDescription));
  const sentences = segments.map((s) => s.segment.trim()).filter((sentence: string) => sentence.length > 0);

  firstTwoSentences = sentences.slice(0, 2).join(' ');
  if (sentences.length > 2) {
    firstTwoSentences = firstTwoSentences.concat('..');
  }

  if (permitDescription) firstTwoSentences = permitDescription + firstTwoSentences;

  const projectId = relatedActivityId
    ? (
        await getProjectByActivityId(
          {
            electrificationProject: repositories.electrificationProject,
            generalProject: repositories.generalProject,
            housingProject: repositories.housingProject
          },
          relatedActivityId
        )
      )?.projectId
    : undefined;

  const body = confirmationTemplateEnquiry({
    contactName:
      enquiryWithContact.contact?.firstName && enquiryWithContact.contact?.lastName
        ? `${enquiryWithContact.contact?.firstName} ${enquiryWithContact.contact?.lastName}`
        : '',
    activityId: enquiryWithContact.activityId,
    enquiryDescription: firstTwoSentences.trim(),
    enquiryId: enquiryWithContact.enquiryId,
    projectId: projectId,
    initiative: initiative.toLowerCase()
  });

  const emailData = {
    from: configCC,
    to: [enquiryWithContact.contact.email!],
    cc: [configCC],
    subject: `Confirmation of ${toTitleCase(initiative)} Enquiry Submission`,
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
export const generateEnquiryData = async (
  repositories: Pick<Repositories, 'activity' | 'activityContact' | 'contact' | 'initiative'>,
  data: CreateEnquiryInput,
  currentContext: CurrentContext
) => {
  // No activityId is ever sent for a new enquiry - always create a new activity.
  const activityId = await ensureActivityWithPrimaryContact(repositories, currentContext.initiative, currentContext);

  const submittedBy = getCurrentUsername(currentContext);
  if (!submittedBy) throw new Error('Failed to determine submittedBy');

  // Put new enquiry together
  return {
    enquiryId: randomUUID(),
    activityId,
    relatedActivityId: data.relatedActivityId ?? null,
    enquiryDescription: data.enquiryDescription ?? null,
    submittedAt: new Date(),
    submittedBy,
    enquiryStatus: ApplicationStatus.NEW,
    submissionType: data.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  };
};
