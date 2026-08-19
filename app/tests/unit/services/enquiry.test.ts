import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import * as enquiryDomain from '#src/domains/enquiry';
import * as responseFiltering from '#src/parsers/responseFiltering';
import {
  createEnquiryService,
  getEnquiryService,
  listEnquiriesService,
  listRelatedEnquiriesService,
  searchEnquiriesService,
  updateEnquiryService
} from '#src/services/enquiry';
import { Initiative } from '#src/utils/enums/application';
import { ActivityContactRole, EnquirySubmittedMethod } from '#src/utils/enums/projectCommon';

import type { EnquirySearchParameters } from '#types';

vi.mock('config');

const generateEnquiryDataSpy = vi.spyOn(enquiryDomain, 'generateEnquiryData');
const emailEnquiryConfirmationSpy = vi.spyOn(enquiryDomain, 'emailEnquiryConfirmation');
const filterSpy = vi.spyOn(responseFiltering, 'filterActivityResponseByScope');

const ENQUIRY_INCLUDE = {
  activity: {
    include: {
      activityContact: {
        include: {
          contact: true
        }
      }
    }
  }
};

describe('enquiry service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createEnquiryService', () => {
    it('generates data, creates the enquiry, upserts the contact and links related contacts', async () => {
      const relatedContact = { activityId: TEST_ENQUIRY_INTAKE.relatedActivityId, contactId: 'other-contact-id' };

      generateEnquiryDataSpy.mockResolvedValue(TEST_ENQUIRY_1);
      mockRepos.enquiry.create.mockResolvedValue(TEST_ENQUIRY_1 as never);
      mockRepos.contact.upsert.mockResolvedValue(TEST_CONTACT_1 as never);
      mockRepos.contact.search.mockResolvedValue([TEST_CONTACT_1] as never);
      mockRepos.activityContact.findMany.mockResolvedValue([relatedContact] as never);
      mockRepos.activityContact.create.mockResolvedValue(undefined as never);
      emailEnquiryConfirmationSpy.mockResolvedValue(undefined);

      const result = await createEnquiryService(TEST_CURRENT_CONTEXT, TEST_ENQUIRY_INTAKE);

      expect(generateEnquiryDataSpy).toHaveBeenCalledTimes(1);
      expect(generateEnquiryDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: mockRepos.activity,
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact,
          initiative: mockRepos.initiative
        }),
        TEST_ENQUIRY_INTAKE,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.enquiry.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.create).toHaveBeenCalledWith({
        ...TEST_ENQUIRY_1,
        assignedUserId: null,
        addedToAts: false,
        atsClientId: null,
        atsEnquiryId: null,
        submittedMethod: EnquirySubmittedMethod.PCNS
      });

      expect(mockRepos.contact.upsert).toHaveBeenCalledTimes(1);
      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        { contactId: TEST_ENQUIRY_INTAKE.contact.contactId },
        TEST_ENQUIRY_INTAKE.contact,
        TEST_ENQUIRY_INTAKE.contact
      );

      expect(mockRepos.contact.search).toHaveBeenCalledWith({ userId: [TEST_CURRENT_CONTEXT.userId] });
      expect(mockRepos.activityContact.findMany).toHaveBeenCalledWith({
        where: {
          activityId: TEST_ENQUIRY_INTAKE.relatedActivityId,
          NOT: {
            contactId: TEST_CONTACT_1.contactId
          }
        }
      });
      expect(mockRepos.activityContact.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ENQUIRY_1.activityId,
        contactId: relatedContact.contactId,
        role: ActivityContactRole.MEMBER
      });

      expect(emailEnquiryConfirmationSpy).toHaveBeenCalledTimes(1);
      expect(emailEnquiryConfirmationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          electrificationProject: mockRepos.electrificationProject,
          generalProject: mockRepos.generalProject,
          housingProject: mockRepos.housingProject
        }),
        { ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 },
        TEST_CURRENT_CONTEXT.initiative,
        TEST_ENQUIRY_INTAKE.relatedActivityId
      );

      expect(result).toEqual({ ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 });
    });

    it('skips related contact linking when there is no relatedActivityId', async () => {
      const intakeNoRelated = { ...TEST_ENQUIRY_INTAKE, relatedActivityId: undefined };

      generateEnquiryDataSpy.mockResolvedValue(TEST_ENQUIRY_1);
      mockRepos.enquiry.create.mockResolvedValue(TEST_ENQUIRY_1 as never);
      mockRepos.contact.upsert.mockResolvedValue(TEST_CONTACT_1 as never);
      emailEnquiryConfirmationSpy.mockResolvedValue(undefined);

      const result = await createEnquiryService(TEST_CURRENT_CONTEXT, intakeNoRelated);

      expect(mockRepos.enquiry.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.contact.search).not.toHaveBeenCalled();
      expect(mockRepos.activityContact.findMany).not.toHaveBeenCalled();
      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
      expect(emailEnquiryConfirmationSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          electrificationProject: mockRepos.electrificationProject,
          generalProject: mockRepos.generalProject,
          housingProject: mockRepos.housingProject
        }),
        { ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 },
        TEST_CURRENT_CONTEXT.initiative,
        undefined
      );
      expect(result).toEqual({ ...TEST_ENQUIRY_1, contact: TEST_CONTACT_1 });
    });
  });

  describe('getEnquiryService', () => {
    it('fetches a single enquiry by id with the activity/contact include', async () => {
      mockRepos.enquiry.findFirstOrThrow.mockResolvedValue(TEST_ENQUIRY_1 as never);

      const result = await getEnquiryService(TEST_ENQUIRY_1.enquiryId);

      expect(mockRepos.enquiry.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.findFirstOrThrow).toHaveBeenCalledWith({
        where: { enquiryId: TEST_ENQUIRY_1.enquiryId },
        include: ENQUIRY_INCLUDE
      });
      expect(result).toEqual(TEST_ENQUIRY_1);
    });
  });

  describe('listEnquiriesService', () => {
    it('lists enquiries and filters the response by scope', async () => {
      const enquiries = [TEST_ENQUIRY_1];
      mockRepos.enquiry.findMany.mockResolvedValue(enquiries as never);
      filterSpy.mockResolvedValue(enquiries as never);

      const result = await listEnquiriesService(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT);

      expect(mockRepos.enquiry.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.findMany).toHaveBeenCalledWith({
        include: { ...ENQUIRY_INCLUDE, user: true }
      });
      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({ activityContact: mockRepos.activityContact, contact: mockRepos.contact }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        enquiries
      );
      expect(result).toEqual(enquiries);
    });
  });

  describe('listRelatedEnquiriesService', () => {
    it('lists related enquiries for an activity and filters by scope', async () => {
      const enquiries = [TEST_ENQUIRY_1];
      mockRepos.enquiry.findMany.mockResolvedValue(enquiries as never);
      filterSpy.mockResolvedValue(enquiries as never);

      const result = await listRelatedEnquiriesService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        'ACTI1234'
      );

      expect(mockRepos.enquiry.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.findMany).toHaveBeenCalledWith({
        where: { relatedActivityId: 'ACTI1234' },
        include: ENQUIRY_INCLUDE,
        orderBy: { createdAt: 'asc' }
      });
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({ activityContact: mockRepos.activityContact, contact: mockRepos.contact }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        enquiries
      );
      expect(result).toEqual(enquiries);
    });
  });

  describe('searchEnquiriesService', () => {
    it('searches enquiries via the repository and filters by scope', async () => {
      const params: EnquirySearchParameters = { enquiryId: [TEST_ENQUIRY_1.enquiryId], includeUser: true };
      const enquiries = [TEST_ENQUIRY_1];
      mockRepos.enquiry.search.mockResolvedValue(enquiries as never);
      filterSpy.mockResolvedValue(enquiries as never);

      const result = await searchEnquiriesService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        params,
        Initiative.ELECTRIFICATION
      );

      expect(mockRepos.enquiry.search).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.search).toHaveBeenCalledWith(params, Initiative.ELECTRIFICATION);
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({ activityContact: mockRepos.activityContact, contact: mockRepos.contact }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        enquiries
      );
      expect(result).toEqual(enquiries);
    });
  });

  describe('updateEnquiryService', () => {
    it('updates the enquiry then returns the refreshed record', async () => {
      const data = { enquiryDescription: 'Updated description' };
      mockRepos.enquiry.update.mockResolvedValue(TEST_ENQUIRY_1 as never);
      mockRepos.enquiry.findFirstOrThrow.mockResolvedValue(TEST_ENQUIRY_1 as never);

      const result = await updateEnquiryService(data, TEST_ENQUIRY_1.enquiryId);

      expect(mockRepos.enquiry.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.update).toHaveBeenCalledWith({ enquiryId: TEST_ENQUIRY_1.enquiryId }, data);
      expect(mockRepos.enquiry.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.enquiry.findFirstOrThrow).toHaveBeenCalledWith({
        where: { enquiryId: TEST_ENQUIRY_1.enquiryId },
        include: ENQUIRY_INCLUDE
      });
      expect(result).toEqual(TEST_ENQUIRY_1);
    });
  });
});
