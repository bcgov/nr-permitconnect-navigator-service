import { emailEnquiryConfirmation, generateEnquiryData } from '../domains/enquiry.ts';
import { unitOfWork } from '../repository/uow.ts';
import { ActivityContactRole, EnquirySubmittedMethod } from '../utils/enums/projectCommon.ts';

import type {
  CurrentAuthorization,
  CurrentContext,
  Enquiry,
  EnquiryIntake,
  EnquirySearchParameters
} from '../types/index.ts';
import { filterActivityResponseByScope } from '../parsers/responseFiltering.ts';
import { Initiative } from '../utils/enums/application.ts';
import { Prisma } from '@prisma/client';

/**
 * Creates a new enquiry
 * @param currentContext - Context data of current request
 * @param intakeData - The enquiry data to create
 * @returns A Promise that resolves to the created enquiry
 */
export const createEnquiryService = async (
  currentContext: CurrentContext,
  intakeData: EnquiryIntake
): Promise<Enquiry> => {
  return await unitOfWork.execute(
    async ({
      activity,
      activityContact,
      contact,
      electrificationProject,
      enquiry,
      generalProject,
      housingProject,
      initiative
    }) => {
      const enquiryData = await generateEnquiryData(
        { activity, activityContact, contact, initiative },
        intakeData,
        currentContext
      );

      // Create new enquiry
      const result = await enquiry.create({
        ...enquiryData,
        assignedUserId: null,
        addedToAts: false,
        atsClientId: null,
        atsEnquiryId: null,
        submittedMethod: EnquirySubmittedMethod.PCNS
      });

      // Update the contact
      const contactResponse = await contact.upsert(
        { contactId: intakeData.contact.contactId },
        intakeData.contact,
        intakeData.contact
      );

      // Create additional activity_contact links if the enquiry is related to a project
      if (intakeData.relatedActivityId) {
        const currentContact = await contact.search({ userId: [currentContext.userId!] });

        const relatedContacts = await activityContact.findMany({
          where: {
            activityId: intakeData.relatedActivityId,
            NOT: {
              contactId: currentContact[0].contactId
            }
          }
        });

        await Promise.all(
          relatedContacts.map(async (x) =>
            activityContact.create({
              activityId: result.activityId,
              contactId: x.contactId,
              role: ActivityContactRole.MEMBER
            })
          )
        );
      }

      await emailEnquiryConfirmation(
        {
          electrificationProject,
          generalProject,
          housingProject
        },
        { ...result, contact: contactResponse },
        currentContext.initiative,
        intakeData.relatedActivityId
      );

      return { ...result, contact: contactResponse };
    }
  );
};

export const deleteEnquiryService = async (enquiryId: string): Promise<void> => {
  return await unitOfWork.execute(async ({ activity, enquiry }) => {
    const e = await enquiry.findFirstOrThrow({ where: { enquiryId } });
    await enquiry.delete({ enquiryId });
    await activity.delete({ activityId: e?.activityId });
  });
};

/**
 * Gets a specific enquiry from the PCNS database
 * @param enquiryId - ID of the enquiry to obtain
 * @returns A Promise that resolves into the specific enquiry
 */
export const getEnquiryService = async (enquiryId: string): Promise<Enquiry> => {
  return await unitOfWork.execute(async ({ enquiry }) => {
    return await enquiry.findFirstOrThrow({
      where: {
        enquiryId: enquiryId
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      }
    });
  });
};

/**
 * Gets a list of enquiries
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @returns A Promise that resolves to an array of enquiries
 */
export const listEnquiriesService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext
): Promise<Enquiry[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, enquiry }) => {
    const result = await enquiry.findMany({
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        },
        user: true
      }
    });

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Gets a list of enquiries related to the given activityId
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param activityId Activity ID
 * @returns A Promise that resolves to an array of related enquiries
 */
export const listRelatedEnquiriesService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  activityId: string
): Promise<Enquiry[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, enquiry }) => {
    const result = await enquiry.findMany({
      where: {
        relatedActivityId: activityId
      },
      include: {
        activity: {
          include: {
            activityContact: {
              include: {
                contact: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Search and filter for specific enquiries
 * @param currentAuthorization - Authorizations assigned to the current authorized user
 * @param currentContext - Context data of current request
 * @param params Optional filtering parameters
 * @param params.activityId Optional array of uuids representing the activity ID
 * @param params.createdBy Optional array of uuids representing users who created enquiries
 * @param params.enquiryId Optional array of uuids representing the enquiry ID
 * @param params.includeUser Optional boolean representing whether the linked user should be included
 * @param initiative Initiative to search in
 * @returns A Promise that resolves to an array of enquiries from search params
 */
export const searchEnquiriesService = async (
  currentAuthorization: CurrentAuthorization,
  currentContext: CurrentContext,
  params: EnquirySearchParameters,
  initiative: Initiative
): Promise<Enquiry[]> => {
  return await unitOfWork.execute(async ({ activityContact, contact, enquiry }) => {
    const result = await enquiry.search(params, initiative);

    return await filterActivityResponseByScope(
      { activityContact, contact },
      currentAuthorization,
      currentContext,
      result
    );
  });
};

/**
 * Updates a specific enquiry
 * @param data Enquiry to update
 * @param enquiryId ID of the enquiry to update
 * @returns A Promise that resolves to the updated enquiry
 */
export const updateEnquiryService = async (
  data: Omit<Prisma.enquiryUpdateInput, 'enquiryId'>,
  enquiryId: string
): Promise<Enquiry> => {
  return await unitOfWork.execute(async ({ enquiry }) => {
    return enquiry.update({ enquiryId }, data);
  });
};
