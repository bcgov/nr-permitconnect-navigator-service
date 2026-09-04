import { mockReset } from 'vitest-mock-extended';

import { TEST_ACTIVITY_GENERAL, TEST_CURRENT_CONTEXT, TEST_GENERAL_PROJECT_INTAKE } from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import * as activityDomain from '#src/domains/activity';
import { createGeneralProjectData, generateGeneralProjectData } from '#src/domains/generalProject';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { SubmitGeneralProjectDraftRequest } from '#types';

type AppliedPermitInput = NonNullable<SubmitGeneralProjectDraftRequest['permits']['appliedPermits']>[number];
type InvestigatePermitInput = NonNullable<SubmitGeneralProjectDraftRequest['permits']['investigatePermits']>[number];

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

describe('generalProject domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createGeneralProjectData', () => {
    it('should build a project from the ensured activity', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_GENERAL.activityId
      );

      const result = await createGeneralProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(activityDomain.ensureActivityWithPrimaryContact).toHaveBeenCalledWith(
        mockRepos,
        Initiative.GENERAL,
        TEST_CURRENT_CONTEXT
      );
      expect(result.generalProject.activityId).toBe(TEST_ACTIVITY_GENERAL.activityId);
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockRejectedValueOnce(
        new Error('Failed to generate activity ID')
      );

      await expect(createGeneralProjectData(mockRepos, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should return a blank project shell with defaults and no permits', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_GENERAL.activityId
      );

      const result = await createGeneralProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(result.generalProject.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.generalProject.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.generalProject.generalProjectId).toBeDefined();
      expect(result.appliedPermits).toEqual([]);
      expect(result.investigatePermits).toEqual([]);
      expect(result.appliedPermitTrackers).toEqual([]);
    });
  });

  describe('generateGeneralProjectData', () => {
    it('should build a project from the ensured activity when activityId not provided', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockResolvedValueOnce(
        TEST_ACTIVITY_GENERAL.activityId
      );

      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: null
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.ensureActivityWithPrimaryContact).toHaveBeenCalledWith(
        mockRepos,
        Initiative.GENERAL,
        TEST_CURRENT_CONTEXT,
        null
      );
      expect(result.generalProject.activityId).toBe(TEST_ACTIVITY_GENERAL.activityId);
    });

    it('should use provided activityId and skip activity creation', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(mockRepos.activity.create).not.toHaveBeenCalled();
      expect(result.generalProject.activityId).toBe('ACTI1234');
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'ensureActivityWithPrimaryContact').mockRejectedValueOnce(
        new Error('Failed to generate activity ID')
      );

      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: null
      };

      await expect(generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should populate basic project fields from intake', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.generalProject.projectName).toBe('NAME');
      expect(result.generalProject.projectDescription).toBe('DESCRIPTION');
      expect(result.generalProject.companyIdRegistered).toBe('FM0281610');
      expect(result.generalProject.companyNameRegistered).toBe('COMPANY');
    });

    it('should populate location fields from intake', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.generalProject.projectLocation).toBe('Location');
      expect(result.generalProject.locality).toBe('Place');
      expect(result.generalProject.province).toBe('AA');
      expect(result.generalProject.streetAddress).toBe('123 Street');
      expect(result.generalProject.naturalDisaster).toBe(false);
    });

    it('should handle empty applied permits list', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234',
        permits: {
          appliedPermits: [],
          hasAppliedProvincialPermits: BasicResponse.NO,
          investigatePermits: []
        }
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.appliedPermits).toEqual([]);
      expect(result.investigatePermits).toEqual([]);
      expect(result.appliedPermitTrackers).toEqual([]);
    });

    it('should transform applied permits correctly', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234',
        permits: {
          appliedPermits: [
            {
              permitTypeId: 1,
              submittedDate: new Date()
            } as unknown as AppliedPermitInput
          ],
          hasAppliedProvincialPermits: BasicResponse.NO,
          investigatePermits: []
        }
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.appliedPermits).toHaveLength(1);
      const permit = result.appliedPermits[0];
      expect(permit.permitTypeId).toBe(1);
      expect(permit.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(permit.needed).toBe(PermitNeeded.YES);
      expect(permit.state).toBe(PermitState.IN_PROGRESS);
      expect(permit.permitId).toBeDefined();
    });

    it('should transform investigate permits correctly', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234',
        permits: {
          appliedPermits: [],
          hasAppliedProvincialPermits: BasicResponse.NO,
          investigatePermits: [
            {
              permitTypeId: 2
            } as unknown as InvestigatePermitInput
          ]
        }
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.investigatePermits).toHaveLength(1);
      const permit = result.investigatePermits[0];
      expect(permit.permitId).toBeDefined();
      expect(permit.stage).toBe(PermitStage.PRE_SUBMISSION);
      expect(permit.needed).toBe(PermitNeeded.UNDER_INVESTIGATION);
      expect(permit.state).toBe(PermitState.NONE);
    });

    it('should set defaults for project fields', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.generalProject.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.generalProject.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.generalProject.aaiUpdated).toBe(false);
      expect(result.generalProject.queuePriority).toBeNull();
      expect(result.generalProject.assignedUserId).toBeNull();
    });
  });
});
