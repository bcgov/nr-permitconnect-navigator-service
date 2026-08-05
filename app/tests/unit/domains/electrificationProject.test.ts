import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_INTAKE
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as activityDomain from '../../../src/domains/activity.ts';
import { generateElectrificationProjectData } from '../../../src/domains/electrificationProject.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { ApplicationStatus, SubmissionType } from '../../../src/utils/enums/projectCommon.ts';

vi.mock('../../../src/external/ches');
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

describe('electrificationProject domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('generateElectrificationProjectData', () => {
    it('should create activity and link contact when activityId not provided', async () => {
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION as never);

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).toHaveBeenCalledWith(
        {
          activity: mockRepos.activity,
          initiative: mockRepos.initiative
        },
        Initiative.ELECTRIFICATION
      );
      expect(mockRepos.contact.search).toHaveBeenCalledWith({
        userId: [TEST_CURRENT_CONTEXT.userId]
      });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ACTIVITY_ELECTRIFICATION.activityId,
        contactId: TEST_CONTACT_1.contactId,
        role: 'PRIMARY'
      });
      expect(result.electrificationProjectId).toBeDefined();
      expect(result.activityId).toBe(TEST_ACTIVITY_ELECTRIFICATION.activityId);
    });

    it('should use provided activityId and skip activity creation', async () => {
      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).not.toHaveBeenCalled();
      expect(result.activityId).toBe('ACTI1234');
    });

    it('should throw error when activity creation fails', async () => {
      mockRepos.contact.search.mockResolvedValueOnce([] as never);
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(undefined as never);

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: undefined
      };

      await expect(generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should populate all project fields from intake data', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_ELECTRIFICATION as never);

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.projectName).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.projectName);
      expect(result.projectDescription).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.projectDescription);
      expect(result.companyIdRegistered).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.registeredId);
      expect(result.companyNameRegistered).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.registeredName);
      expect(result.bcHydroNumber).toBe(TEST_ELECTRIFICATION_INTAKE.project?.bcHydroNumber);
      expect(result.projectType).toBe(TEST_ELECTRIFICATION_INTAKE.project?.projectType);
      expect(result.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.submittedAt).toBeInstanceOf(Date);
    });

    it('should set defaults for optional fields', async () => {
      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234',
        basic: {
          ...TEST_ELECTRIFICATION_INTAKE.basic,
          registeredId: undefined,
          registeredName: undefined
        }
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.companyIdRegistered).toBeNull();
      expect(result.companyNameRegistered).toBeNull();
      expect(result.aaiUpdated).toBe(false);
      expect(result.addedToAts).toBe(false);
      expect(result.queuePriority).toBeNull();
    });
  });
});
