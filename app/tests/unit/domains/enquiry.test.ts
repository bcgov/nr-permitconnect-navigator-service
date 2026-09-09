import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_EMAIL_RESPONSE,
  TEST_ENQUIRY_1,
  TEST_ENQUIRY_INTAKE,
  TEST_HOUSING_PROJECT_1
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import * as activityDomain from '#src/domains/activity';
import { emailEnquiryConfirmation, generateEnquiryData } from '#src/domains/enquiry';
import * as projectDomain from '#src/domains/project';
import { getCurrentUsername } from '#src/utils/index';
import { Initiative } from '#src/utils/enums/application';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { ContactBase, Enquiry } from '#types';

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
        if (key === 'server.pcbcUrl') return 'www.example.com';

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
      expect(emailCall?.subject).toBe('Confirmation of Housing Enquiry Submission');
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
    it('should always create a new activity (no activityId in the request shape)', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const result = await generateEnquiryData(mockRepos, TEST_ENQUIRY_INTAKE, TEST_CURRENT_CONTEXT);

      expect(activityDomain.ensureActivityWithPrimaryContact).toHaveBeenCalledWith(
        mockRepos,
        TEST_CURRENT_CONTEXT.initiative,
        TEST_CURRENT_CONTEXT
      );
      expect(result.activityId).toBe(TEST_ACTIVITY_ELECTRIFICATION.activityId);
    });

    it('should throw error if activity creation fails', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockRejectedValueOnce(
        new Error('Failed to generate activity ID')
      );

      await expect(generateEnquiryData(mockRepos, TEST_ENQUIRY_INTAKE, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should throw error when submittedBy cannot be determined', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );
      vi.mocked(getCurrentUsername).mockReturnValueOnce(undefined);

      await expect(generateEnquiryData(mockRepos, TEST_ENQUIRY_INTAKE, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to determine submittedBy'
      );
    });

    it('should generate a random enquiryId and set submittedAt/submittedBy/enquiryStatus', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValue(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const result1 = await generateEnquiryData(mockRepos, TEST_ENQUIRY_INTAKE, TEST_CURRENT_CONTEXT);
      const result2 = await generateEnquiryData(mockRepos, TEST_ENQUIRY_INTAKE, TEST_CURRENT_CONTEXT);

      expect(result1.enquiryId).toBeDefined();
      expect(result1.enquiryId).not.toBe(result2.enquiryId);
      expect(result1.submittedAt).toBeInstanceOf(Date);
      expect(result1.submittedBy).toBe('test-user');
      expect(result1.enquiryStatus).toBe(ApplicationStatus.NEW);
    });

    it('should default submissionType when not provided', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const intake = { ...TEST_ENQUIRY_INTAKE, submissionType: undefined };
      const result = await generateEnquiryData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.submissionType).toBe(SubmissionType.GENERAL_ENQUIRY);
    });

    it('should default relatedActivityId and enquiryDescription to null when omitted', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const intake = { ...TEST_ENQUIRY_INTAKE, relatedActivityId: undefined, enquiryDescription: undefined };
      const result = await generateEnquiryData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.relatedActivityId).toBeNull();
      expect(result.enquiryDescription).toBeNull();
    });
  });
});
