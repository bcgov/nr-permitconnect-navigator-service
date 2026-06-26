import config from 'config';
import { v4 as uuidv4 } from 'uuid';

import { createActivity } from './activity';
import { getProjectByActivityId } from './project';
import { email } from '../external/ches';
import { Repositories } from '../repository/uow';
import { getCurrentUsername } from '../utils';
import { Initiative } from '../utils/enums/application';
import { ActivityContactRole, ApplicationStatus, SubmissionType } from '../utils/enums/projectCommon';
import { confirmationTemplateEnquiry } from '../utils/templates';

import type { ContactBase, CurrentContext, Enquiry, EnquiryBase, EnquiryIntake } from '../types';

export async function emailEnquiryConfirmation(
  repositories: Pick<Repositories, 'electrificationProject' | 'generalProject' | 'housingProject'>,
  enquiryWithContact: Enquiry & { contact: ContactBase },
  initiative: string,
  relatedActivityId?: string
) {
  const configCC = config.get<string>('server.ches.submission.cc');

  let permitDescription = '';
  let enquiryDescription: string = enquiryWithContact.enquiryDescription || '';
  let firstTwoSentences: string;

  // If has permit description convert \n to <br>
  if (enquiryDescription.includes('Tracking ID:')) {
    const descriptionSplit = enquiryDescription.split('\n\n');
    permitDescription = descriptionSplit[0]?.replace(/\n/g, '<br>') + '<br><br>';
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
    subject: 'Confirmation of Enquiry Submission',
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
  data: EnquiryIntake,
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

  // Put new enquiry together
  return {
    enquiryId: data.enquiryId ?? uuidv4(),
    activityId: activityId,
    relatedActivityId: data.relatedActivityId,
    enquiryDescription: data.enquiryDescription,
    submittedAt: data.submittedAt ? new Date(data.submittedAt) : new Date(),
    submittedBy: getCurrentUsername(currentContext),
    enquiryStatus: data.enquiryStatus ?? ApplicationStatus.NEW,
    submissionType: data?.submissionType ?? SubmissionType.GENERAL_ENQUIRY
  } as EnquiryBase;
};
