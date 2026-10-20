import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_INTAKE
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import * as activityDomain from '#src/domains/activity';
import {
  createElectrificationProjectData,
  generateElectrificationProjectData
} from '#src/domains/electrificationProject';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

vi.mock('../../../src/external/ches');
vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.ches.submission.cc') return 'noreply@example.com';
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcbcUrl') return 'www.example.com';
        if (key === 'server.env') return 'test';

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
    it('should build a project from the ensured activity when activityId not provided', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.ensureActivityWithPrimaryContact).toHaveBeenCalledWith(
        mockRepos,
        Initiative.ELECTRIFICATION,
        TEST_CURRENT_CONTEXT,
        intake.activityId
      );
      expect(result.electrificationProject.electrificationProjectId).toBeDefined();
      expect(result.electrificationProject.activityId).toBe(TEST_ACTIVITY_ELECTRIFICATION.activityId);
    });

    it('should use provided activityId and skip activity creation', async () => {
      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(mockRepos.activity.create).not.toHaveBeenCalled();
      expect(result.electrificationProject.activityId).toBe('ACTI1234');
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockRejectedValueOnce(
        new Error('Failed to generate activity ID')
      );

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: undefined
      };

      await expect(generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should populate all project fields from intake data', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.electrificationProject.projectName).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.projectName);
      expect(result.electrificationProject.projectDescription).toBe(
        TEST_ELECTRIFICATION_INTAKE.basic?.projectDescription
      );
      expect(result.electrificationProject.companyIdRegistered).toBe(TEST_ELECTRIFICATION_INTAKE.basic?.registeredId);
      expect(result.electrificationProject.companyNameRegistered).toBe(
        TEST_ELECTRIFICATION_INTAKE.basic?.registeredName
      );
      expect(result.electrificationProject.bcHydroNumber).toBe(TEST_ELECTRIFICATION_INTAKE.project?.bcHydroNumber);
      expect(result.electrificationProject.projectType).toBe(TEST_ELECTRIFICATION_INTAKE.project?.projectType);
      expect(result.electrificationProject.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.electrificationProject.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.electrificationProject.submittedAt).toBeInstanceOf(Date);
    });

    it('should set defaults for optional fields', async () => {
      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234',
        basic: {
          ...TEST_ELECTRIFICATION_INTAKE.basic,
          registeredId: undefined
        }
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.electrificationProject.companyIdRegistered).toBeNull();
      expect(result.electrificationProject.aaiUpdated).toBe(false);
      expect(result.electrificationProject.addedToAts).toBe(false);
      expect(result.electrificationProject.queuePriority).toBeNull();
    });

    it('should store hasAppliedProvincialPermits and build permits from the intake', async () => {
      const intake = {
        ...TEST_ELECTRIFICATION_INTAKE,
        activityId: 'ACTI1234',
        permits: {
          hasAppliedProvincialPermits: BasicResponse.YES,
          appliedPermits: [{ permitTypeId: 1, permitTracking: [{ trackingId: 'TRK-1' }] }],
          investigatePermits: [{ permitTypeId: 2 }]
        }
      };

      const result = await generateElectrificationProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.electrificationProject.hasAppliedProvincialPermits).toBe(BasicResponse.YES);
      expect(result.appliedPermits).toHaveLength(1);
      expect(result.appliedPermits[0].activityId).toBe('ACTI1234');
      expect(result.appliedPermitTrackers).toHaveLength(1);
      expect(result.appliedPermitTrackers[0].permitId).toBe(result.appliedPermits[0].permitId);
      expect(result.investigatePermits).toHaveLength(1);
    });
  });

  describe('createElectrificationProjectData', () => {
    it('should build a project from the ensured activity', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const result = await createElectrificationProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(activityDomain.ensureActivityWithPrimaryContact).toHaveBeenCalledWith(
        mockRepos,
        Initiative.ELECTRIFICATION,
        TEST_CURRENT_CONTEXT
      );
      expect(result.activityId).toBe(TEST_ACTIVITY_ELECTRIFICATION.activityId);
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockRejectedValueOnce(
        new Error('Failed to generate activity ID')
      );

      await expect(createElectrificationProjectData(mockRepos, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should return a blank project shell with defaults', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_ELECTRIFICATION.activityId
      );

      const result = await createElectrificationProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(result.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.electrificationProjectId).toBeDefined();
    });
  });
});
