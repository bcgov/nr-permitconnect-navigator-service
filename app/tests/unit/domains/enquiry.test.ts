import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE,
  TEST_HOUSING_PROJECT_1,
  TEST_EMAIL_RESPONSE
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { emailEnquiryConfirmation, generateEnquiryData } from '../../../src/domains/enquiry.ts';
import * as projectDomain from '../../../src/domains/project.ts';
import * as activityDomain from '../../../src/domains/activity.ts';
import { ApplicationStatus, SubmissionType } from '../../../src/utils/enums/projectCommon.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { ContactBase, Enquiry } from '../../../src/types/index.ts';

vi.mock('../../../src/domains/project.ts');
vi.mock('../../../src/domains/activity.ts');
vi.mock('../../../src/external/ches.ts');
vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.ches.submission.cc') return 'noreply@example.com';
        if (key === 'server.pcns.appUrl') return 'www.example.com';

        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});
vi.mock('../../../src/utils/index.ts', async () => {
  const actual = await vi.importActual('../../../src/utils/index.ts');
  return {
    ...actual,
    getCurrentUsername: vi.fn(() => 'test-user')
  };
});

describe('enquiry domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('emailEnquiryConfirmation', () => {
    it('should send confirmation email with enquiry description', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const enquiryWithContact: Enquiry & { contact: ContactBase } = {
        ...TEST_ENQUIRY_1,
        contact: TEST_CONTACT_1,
        enquiryDescription: 'This is the first sentence. This is the second sentence. This is the third sentence.'
      };

      await emailEnquiryConfirmation(mockRepos, enquiryWithContact, Initiative.HOUSING);

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.to).toContain(TEST_CONTACT_1.email);
      expect(emailCall?.subject).toBe('Confirmation of Enquiry Submission');
    });

    it('should include first two sentences in email body', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const enquiryWithContact: Enquiry & { contact: ContactBase } = {
        ...TEST_ENQUIRY_1,
        contact: TEST_CONTACT_1,
        enquiryDescription: 'First sentence here. Second sentence here. Third sentence here.'
      };

      await emailEnquiryConfirmation(mockRepos, enquiryWithContact, Initiative.HOUSING);

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.body).toContain('First sentence here');
      expect(emailCall?.body).toContain('Second sentence here');
      expect(emailCall?.body).toContain('..');
    });

    it('should handle enquiry with permit tracking description', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      const emailSpy = vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const enquiryWithContact: Enquiry & { contact: ContactBase } = {
        ...TEST_ENQUIRY_1,
        contact: TEST_CONTACT_1,
        enquiryDescription: 'Tracking ID: ABC123\n\nFirst follow-up sentence. Second follow-up sentence.'
      };

      await emailEnquiryConfirmation(mockRepos, enquiryWithContact, Initiative.HOUSING);

      expect(emailSpy).toHaveBeenCalled();
      const emailCall = emailSpy.mock.calls[0]?.[0];
      expect(emailCall?.body).toContain('Tracking ID: ABC123');
    });

    it('should call getProjectByActivityId when relatedActivityId provided', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const getProjectSpy = vi.spyOn(projectDomain, 'getProjectByActivityId').mockResolvedValue({
        ...TEST_HOUSING_PROJECT_1,
        projectId: TEST_HOUSING_PROJECT_1.housingProjectId
      } as never);

      const enquiryWithContact: Enquiry & { contact: ContactBase } = {
        ...TEST_ENQUIRY_1,
        contact: TEST_CONTACT_1,
        enquiryDescription: 'Test.'
      };

      await emailEnquiryConfirmation(mockRepos, enquiryWithContact, Initiative.HOUSING, 'ACTI1234');

      expect(getProjectSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          electrificationProject: mockRepos.electrificationProject,
          generalProject: mockRepos.generalProject,
          housingProject: mockRepos.housingProject
        }),
        'ACTI1234'
      );
    });

    it('should not call getProjectByActivityId when relatedActivityId not provided', async () => {
      const emailModule = await import('../../../src/external/ches.ts');
      vi.spyOn(emailModule, 'email').mockResolvedValue(TEST_EMAIL_RESPONSE as never);

      const getProjectSpy = vi.spyOn(projectDomain, 'getProjectByActivityId');

      const enquiryWithContact: Enquiry & { contact: ContactBase } = {
        ...TEST_ENQUIRY_1,
        contact: TEST_CONTACT_1,
        enquiryDescription: 'Test.'
      };

      await emailEnquiryConfirmation(mockRepos, enquiryWithContact, Initiative.HOUSING);

      expect(getProjectSpy).not.toHaveBeenCalled();
    });
  });

  describe('generateEnquiryData', () => {
    it('should use provided activityId and return enquiry data', async () => {
      const intakeWithId = { ...TEST_ENQUIRY_INTAKE, activityId: 'EXISTING_ACTI' };

      const result = await generateEnquiryData(mockRepos, intakeWithId, TEST_CURRENT_CONTEXT);

      expect(result.activityId).toBe('EXISTING_ACTI');
      expect(result.submittedBy).toBe('test-user'); // Using the mocked utils return
      expect(result.enquiryStatus).toBe(ApplicationStatus.NEW);
      expect(result.submissionType).toBe(SubmissionType.GENERAL_ENQUIRY);
      // Ensure search is NOT called when activityId is already provided
      expect(mockRepos.contact.search).not.toHaveBeenCalled();
    });

    it('should create activity when activityId not provided', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);

      const intakeWithoutId = { ...TEST_ENQUIRY_INTAKE, activityId: undefined };

      const result = await generateEnquiryData(mockRepos, intakeWithoutId, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).toHaveBeenCalledWith(
        { activity: mockRepos.activity, initiative: mockRepos.initiative },
        TEST_CURRENT_CONTEXT.initiative
      );
      expect(result.activityId).toBe(TEST_ACTIVITY_ELECTRIFICATION.activityId);
    });

    it('should link contact to activity when contact found and activity created', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValueOnce({} as never);

      const intakeWithoutId = { ...TEST_ENQUIRY_INTAKE, activityId: undefined };

      await generateEnquiryData(mockRepos, intakeWithoutId, TEST_CURRENT_CONTEXT);

      expect(mockRepos.contact.search).toHaveBeenCalledWith({ userId: [TEST_CURRENT_CONTEXT.userId] });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith(
        expect.objectContaining({
          activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
          contactId: TEST_CONTACT_1.contactId
        })
      );
    });

    it('should not link contact if search returns empty', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

      const intakeWithoutId = { ...TEST_ENQUIRY_INTAKE, activityId: undefined };

      await generateEnquiryData(mockRepos, intakeWithoutId, TEST_CURRENT_CONTEXT);

      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
    });

    it('should throw error if activity creation fails', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(undefined as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

      const intakeWithoutId = { ...TEST_ENQUIRY_INTAKE, activityId: undefined };

      await expect(generateEnquiryData(mockRepos, intakeWithoutId, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should use provided enquiryId or generate one', async () => {
      const intakeWithId = { ...TEST_ENQUIRY_INTAKE, activityId: 'EXISTING_ACTI', enquiryId: 'EXISTING_ID' };
      const result1 = await generateEnquiryData(mockRepos, intakeWithId, TEST_CURRENT_CONTEXT);

      expect(result1.enquiryId).toBe('EXISTING_ID');

      const intakeWithoutId = { ...TEST_ENQUIRY_INTAKE, activityId: 'EXISTING_ACTI', enquiryId: undefined };
      const result2 = await generateEnquiryData(mockRepos, intakeWithoutId, TEST_CURRENT_CONTEXT);

      expect(result2.enquiryId).toBeDefined();
      expect(result2.enquiryId).not.toBe('EXISTING_ID');
    });

    it('should use provided submittedAt or current date', async () => {
      const customDate = new Date('2024-01-15');
      const intakeWithDate = {
        ...TEST_ENQUIRY_INTAKE,
        activityId: 'EXISTING_ACTI',
        submittedAt: customDate.toISOString()
      };

      const result = await generateEnquiryData(mockRepos, intakeWithDate, TEST_CURRENT_CONTEXT);

      expect(result.submittedAt).toEqual(new Date(customDate));
    });
  });
});
