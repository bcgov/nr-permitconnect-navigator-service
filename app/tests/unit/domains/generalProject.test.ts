import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CURRENT_CONTEXT,
  TEST_CONTACT_1,
  TEST_GENERAL_PROJECT_INTAKE,
  TEST_ACTIVITY_GENERAL,
  TEST_PERMIT_1
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as activityDomain from '../../../src/domains/activity.ts';
import { generateGeneralProjectData } from '../../../src/domains/generalProject.ts';

import { Initiative } from '../../../src/utils/enums/application.ts';
import { ApplicationStatus, SubmissionType } from '../../../src/utils/enums/projectCommon.ts';
import { PermitNeeded } from '../../../src/utils/enums/permit.ts';
import { PermitStage, PermitState } from '../../../src/db/codes/enums.ts';

import type { Permit } from '../../../src/types/index.ts';

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

describe('generalProject domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('generateGeneralProjectData', () => {
    it('should create activity and link contact when activityId not provided', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_GENERAL as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValueOnce({} as never);

      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: null
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).toHaveBeenCalledWith(
        {
          activity: mockRepos.activity,
          initiative: mockRepos.initiative
        },
        Initiative.GENERAL
      );
      expect(mockRepos.contact.search).toHaveBeenCalledWith({
        userId: [TEST_CURRENT_CONTEXT.userId]
      });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ACTIVITY_GENERAL.activityId,
        contactId: TEST_CONTACT_1.contactId,
        role: 'PRIMARY'
      });
      expect(result.generalProject.activityId).toBe(TEST_ACTIVITY_GENERAL.activityId);
    });

    it('should use provided activityId and skip activity creation', async () => {
      const intake = {
        ...TEST_GENERAL_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).not.toHaveBeenCalled();
      expect(result.generalProject.activityId).toBe('ACTI1234');
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(undefined as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

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
              ...TEST_PERMIT_1,
              permitId: undefined,
              permitTypeId: 1,
              submittedDate: new Date().toISOString(), // Mock ISO date
              submittedTime: '10:00',
              permitTracking: []
            } as unknown as Permit
          ],
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
          investigatePermits: [
            {
              permitId: 'PERM001',
              permitTypeId: 2,
              submittedTime: '14:00'
            } as never
          ]
        }
      };

      const result = await generateGeneralProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.investigatePermits).toHaveLength(1);
      const permit = result.investigatePermits[0];
      expect(permit.permitId).toBe('PERM001');
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
