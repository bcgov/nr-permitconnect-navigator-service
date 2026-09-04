import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_HOUSING,
  TEST_CONTACT_1,
  TEST_CURRENT_CONTEXT,
  TEST_HOUSING_PROJECT_INTAKE
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { PermitStage, PermitState } from '#src/db/codes/enums';
import * as activityDomain from '#src/domains/activity';
import { assignPriority, createHousingProjectData, generateHousingProjectData } from '#src/domains/housingProject';
import { getCurrentUsername } from '#src/utils/index';
import { BasicResponse, Initiative } from '#src/utils/enums/application';
import { NumResidentialUnits } from '#src/utils/enums/housing';
import { PermitNeeded } from '#src/utils/enums/permit';
import { ApplicationStatus, SubmissionType } from '#src/utils/enums/projectCommon';

import type { HousingProject, SubmitHousingProjectDraftRequest } from '#types';

type AppliedPermitInput = NonNullable<SubmitHousingProjectDraftRequest['permits']['appliedPermits']>[number];
type InvestigatePermitInput = NonNullable<SubmitHousingProjectDraftRequest['permits']['investigatePermits']>[number];

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
vi.mock('../../../src/utils/index.ts', async () => {
  const actual = await vi.importActual('../../../src/utils/index.ts');
  return {
    ...actual,
    getCurrentUsername: vi.fn(() => 'test-user')
  };
});

describe('housingProject domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('assignPriority', () => {
    it('should assign priority 1 when single family units > 50', () => {
      const project: Partial<HousingProject> = {
        singleFamilyUnits: NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(1);
    });

    it('should assign priority 1 when multi family units > 50', () => {
      const project: Partial<HousingProject> = {
        multiFamilyUnits: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(1);
    });

    it('should assign priority 1 when has rental units', () => {
      const project: Partial<HousingProject> = {
        hasRentalUnits: BasicResponse.YES,
        singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
        multiFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(1);
    });

    it('should assign priority 1 when financially supported by BC', () => {
      const project: Partial<HousingProject> = {
        financiallySupportedBc: BasicResponse.YES,
        singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
        multiFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(1);
    });

    it('should assign priority 1 when indigenous led', () => {
      const project: Partial<HousingProject> = {
        financiallySupportedIndigenous: BasicResponse.YES,
        singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
        multiFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(1);
    });

    it('should assign priority 2 when single family 10-49 units', () => {
      const project: Partial<HousingProject> = {
        singleFamilyUnits: NumResidentialUnits.TEN_TO_FOURTY_NINE,
        multiFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO,
        financiallySupportedIndigenous: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(2);
    });

    it('should assign priority 2 when multi family 10-49 units', () => {
      const project: Partial<HousingProject> = {
        multiFamilyUnits: NumResidentialUnits.TEN_TO_FOURTY_NINE,
        singleFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO,
        financiallySupportedIndigenous: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(2);
    });

    it('should assign priority 2 when multi family 1-9 units', () => {
      const project: Partial<HousingProject> = {
        multiFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
        singleFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO,
        financiallySupportedIndigenous: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(2);
    });

    it('should assign priority 2 when other units 1-9', () => {
      const project: Partial<HousingProject> = {
        otherUnits: NumResidentialUnits.ONE_TO_NINE,
        singleFamilyUnits: BasicResponse.NO,
        multiFamilyUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO,
        financiallySupportedIndigenous: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(2);
    });

    it('should assign priority 3 for everything else', () => {
      const project: Partial<HousingProject> = {
        singleFamilyUnits: BasicResponse.NO,
        multiFamilyUnits: BasicResponse.NO,
        otherUnits: BasicResponse.NO,
        hasRentalUnits: BasicResponse.NO,
        financiallySupportedBc: BasicResponse.NO,
        financiallySupportedIndigenous: BasicResponse.NO
      };

      assignPriority(project);

      expect(project.queuePriority).toBe(3);
    });
  });

  describe('createHousingProjectData', () => {
    it('should create activity and link contact', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_HOUSING as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValueOnce({} as never);

      const result = await createHousingProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).toHaveBeenCalledWith(
        {
          activity: mockRepos.activity,
          initiative: mockRepos.initiative
        },
        Initiative.HOUSING
      );
      expect(mockRepos.contact.search).toHaveBeenCalledWith({
        userId: [TEST_CURRENT_CONTEXT.userId]
      });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ACTIVITY_HOUSING.activityId,
        contactId: TEST_CONTACT_1.contactId,
        role: 'PRIMARY'
      });
      expect(result.housingProject.activityId).toBe(TEST_ACTIVITY_HOUSING.activityId);
    });

    it('should skip linking a contact when none exists for the user', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_HOUSING as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

      await createHousingProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(mockRepos.activityContact.create).not.toHaveBeenCalled();
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(undefined as never);

      await expect(createHousingProjectData(mockRepos, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should throw error when submittedBy cannot be determined', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_HOUSING as never);
      vi.mocked(getCurrentUsername).mockReturnValueOnce(undefined);

      await expect(createHousingProjectData(mockRepos, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to determine submittedBy'
      );
    });

    it('should return a blank project shell with defaults and no permits', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_HOUSING as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

      const result = await createHousingProjectData(mockRepos, TEST_CURRENT_CONTEXT);

      expect(result.housingProject.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.housingProject.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.housingProject.submittedBy).toBe('test-user');
      expect(result.housingProject.housingProjectId).toBeDefined();
      expect(result.appliedPermits).toEqual([]);
      expect(result.investigatePermits).toEqual([]);
      expect(result.appliedPermitTrackers).toEqual([]);
    });
  });

  describe('generateHousingProjectData', () => {
    it('should create activity and link contact when activityId not provided', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(TEST_ACTIVITY_HOUSING as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.create.mockResolvedValueOnce({} as never);

      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: null
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).toHaveBeenCalledWith(
        {
          activity: mockRepos.activity,
          initiative: mockRepos.initiative
        },
        Initiative.HOUSING
      );
      expect(mockRepos.contact.search).toHaveBeenCalledWith({
        userId: [TEST_CURRENT_CONTEXT.userId]
      });
      expect(mockRepos.activityContact.create).toHaveBeenCalledWith({
        activityId: TEST_ACTIVITY_HOUSING.activityId,
        contactId: TEST_CONTACT_1.contactId,
        role: 'PRIMARY'
      });
      expect(result.housingProject.activityId).toBe(TEST_ACTIVITY_HOUSING.activityId);
    });

    it('should throw error when submittedBy cannot be determined', async () => {
      vi.mocked(getCurrentUsername).mockReturnValueOnce(undefined);

      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      await expect(generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to determine submittedBy'
      );
    });

    it('should use provided activityId and skip activity creation', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(activityDomain.createActivity).not.toHaveBeenCalled();
      expect(result.housingProject.activityId).toBe('ACTI1234');
    });

    it('should throw error when activity creation fails', async () => {
      vi.spyOn(activityDomain, 'createActivity').mockResolvedValue(undefined as never);
      mockRepos.contact.search.mockResolvedValueOnce([] as never);

      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: null
      };

      await expect(generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT)).rejects.toThrow(
        'Failed to generate activity ID'
      );
    });

    it('should populate basic housing project fields from intake', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.housingProject.projectName).toBe('NAME');
      expect(result.housingProject.projectDescription).toBe('DESCRIPTION');
      expect(result.housingProject.companyIdRegistered).toBe('FM0281610');
      expect(result.housingProject.companyNameRegistered).toBe('COMPANY');
    });

    it('should populate housing-specific fields from intake', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234',
        housing: {
          singleFamilyUnits: NumResidentialUnits.ONE_TO_NINE,
          multiFamilyUnits: BasicResponse.NO,
          otherUnits: BasicResponse.NO,
          hasRentalUnits: BasicResponse.NO,
          rentalUnits: BasicResponse.NO,
          financiallySupportedBc: BasicResponse.NO,
          financiallySupportedIndigenous: BasicResponse.NO,
          financiallySupportedNonProfit: BasicResponse.NO,
          financiallySupportedHousingCoop: BasicResponse.NO
        }
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.housingProject.singleFamilyUnits).toBe(NumResidentialUnits.ONE_TO_NINE);
      expect(result.housingProject.multiFamilyUnits).toBe(BasicResponse.NO);
      expect(result.housingProject.hasRentalUnits).toBe(BasicResponse.NO);
    });

    it('should populate location fields from intake', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.housingProject.projectLocation).toBe('Location');
      expect(result.housingProject.locality).toBe('Place');
      expect(result.housingProject.province).toBe('AA');
      expect(result.housingProject.streetAddress).toBe('123 Street');
      expect(result.housingProject.naturalDisaster).toBe(false);
    });

    it('should transform applied permits correctly with tracking', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234',
        permits: {
          appliedPermits: [
            {
              permitTypeId: 1,
              submittedDate: new Date(),
              permitTracking: [{ trackingId: 'TRACK001', statusCode: 'SUBMITTED' } as never]
            } as unknown as AppliedPermitInput
          ],
          hasAppliedProvincialPermits: BasicResponse.YES,
          investigatePermits: []
        }
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.appliedPermits).toHaveLength(1);
      const permit = result.appliedPermits[0];
      expect(permit.permitId).toBeDefined();
      expect(permit.stage).toBe(PermitStage.APPLICATION_SUBMISSION);
      expect(permit.needed).toBe(PermitNeeded.YES);

      expect(result.appliedPermitTrackers).toHaveLength(1);
      expect(result.appliedPermitTrackers[0].permitId).toBe(permit.permitId);
    });

    it('should transform investigate permits correctly', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
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

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.investigatePermits).toHaveLength(1);
      const permit = result.investigatePermits[0];
      expect(permit.stage).toBe(PermitStage.PRE_SUBMISSION);
      expect(permit.needed).toBe(PermitNeeded.UNDER_INVESTIGATION);
      expect(permit.state).toBe(PermitState.NONE);
    });

    it('should set defaults for project fields', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result.housingProject.applicationStatus).toBe(ApplicationStatus.NEW);
      expect(result.housingProject.submissionType).toBe(SubmissionType.GUIDANCE);
      expect(result.housingProject.aaiUpdated).toBe(false);
      expect(result.housingProject.astUpdated).toBe(false);
      expect(result.housingProject.queuePriority).toBe(3);
    });

    it('should generate housingProjectId UUID', async () => {
      const intake = {
        ...TEST_HOUSING_PROJECT_INTAKE,
        activityId: 'ACTI1234'
      };

      const result1 = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);
      const result2 = await generateHousingProjectData(mockRepos, intake, TEST_CURRENT_CONTEXT);

      expect(result1.housingProject.housingProjectId).toBeDefined();
      expect(result2.housingProject.housingProjectId).toBeDefined();
      expect(result1.housingProject.housingProjectId).not.toBe(result2.housingProject.housingProjectId);
    });
  });
});
