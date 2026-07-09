import { mockReset } from 'vitest-mock-extended';

import {
  TEST_ACTIVITY_ELECTRIFICATION,
  TEST_ACTIVITY_GENERAL,
  TEST_ACTIVITY_HOUSING,
  TEST_CONTACT_1,
  TEST_ELECTRIFICATION_PROJECT_1,
  TEST_GENERAL_PROJECT_1,
  TEST_HOUSING_PROJECT_1
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import {
  emailProjectConfirmation,
  getProjectByActivityId,
  getProjectByProjectId
} from '../../../src/domains/project.ts';
import { Problem } from '../../../src/utils/index.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { confirmationTemplateHousingSubmission } from '../../../src/utils/templates.ts';

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

describe('project domain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('emailProjectConfirmation', () => {
    it('should send email with correct template data when contact has first and last name', async () => {
      const { email } = await import('../../../src/external/ches.ts');

      await emailProjectConfirmation(
        Initiative.HOUSING,
        'test123',
        'a73fad47-2597-47f9-b13d-94d84e9204d8',
        confirmationTemplateHousingSubmission,
        TEST_CONTACT_1
      );

      expect(email).toHaveBeenCalledOnce();
      const call = vi.mocked(email).mock.calls[0][0];
      expect(call.to).toEqual([TEST_CONTACT_1.email]);
      expect(call.cc).toEqual(['noreply@example.com']);
      expect(call.subject).toBe('Confirmation of Housing Project Submission');
      expect(call.bodyType).toBe('html');
      expect(call.body).toBeDefined();
      expect(call.body.length).toBeGreaterThan(0);
    });

    it('should send email with empty contact name when first/last name missing', async () => {
      const { email } = await import('../../../src/external/ches.ts');

      await emailProjectConfirmation(
        Initiative.HOUSING,
        'test123',
        'a73fad47-2597-47f9-b13d-94d84e9204d8',
        confirmationTemplateHousingSubmission,
        { ...TEST_CONTACT_1, firstName: null, lastName: null }
      );

      expect(email).toHaveBeenCalledOnce();
      expect(vi.mocked(email).mock.calls[0][0].to).toEqual([TEST_CONTACT_1.email]);
    });
  });

  describe('getProjectByActivityId', () => {
    it('should return electrification project when found', async () => {
      const projectWithActivity = {
        ...TEST_ELECTRIFICATION_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_ELECTRIFICATION,
          activityContact: [],
          initiative: { initiativeId: 'init-elec', code: 'ELECTRIFICATION' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      const result = await getProjectByActivityId(mockRepos, 'ACTI1234');

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.electrificationProject.findFirst).toHaveBeenCalledWith({
        where: { activityId: 'ACTI1234' },
        include: expect.objectContaining({
          activity: expect.objectContaining({
            include: expect.any(Object)
          })
        })
      });
    });

    it('should return general project when found', async () => {
      const projectWithActivity = {
        ...TEST_GENERAL_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_GENERAL,
          activityContact: [],
          initiative: { initiativeId: 'init-gen', code: 'GENERAL' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      const result = await getProjectByActivityId(mockRepos, 'ACTI1234');

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.generalProject.findFirst).toHaveBeenCalledWith({
        where: { activityId: 'ACTI1234' },
        include: expect.any(Object)
      });
    });

    it('should return housing project when found', async () => {
      const projectWithActivity = {
        ...TEST_HOUSING_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_HOUSING,
          activityContact: [],
          initiative: { initiativeId: 'init-hou', code: 'HOUSING' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(projectWithActivity as never);

      const result = await getProjectByActivityId(mockRepos, 'ACTI1234');

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.housingProject.findFirst).toHaveBeenCalledWith({
        where: { activityId: 'ACTI1234' },
        include: expect.any(Object)
      });
    });

    it('should throw 404 when project not found in any type', async () => {
      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      await expect(getProjectByActivityId(mockRepos, 'MISSING')).rejects.toThrow(Problem);

      try {
        await getProjectByActivityId(mockRepos, 'MISSING');
      } catch (error) {
        expect((error as Problem).status).toBe(404);
      }
    });

    it('should throw 409 when activity exists in multiple project types', async () => {
      const projectWithActivity = {
        ...TEST_ELECTRIFICATION_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_ELECTRIFICATION,
          activityContact: [],
          initiative: { initiativeId: 'init-elec', code: 'ELECTRIFICATION' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      await expect(getProjectByActivityId(mockRepos, 'ACTI1234')).rejects.toThrow(Problem);

      try {
        await getProjectByActivityId(mockRepos, 'ACTI1234');
      } catch (error) {
        expect((error as Problem).status).toBe(409);
      }
    });
  });

  describe('getProjectByProjectId', () => {
    it('should return electrification project when found by electrificationProjectId', async () => {
      const projectWithActivity = {
        ...TEST_ELECTRIFICATION_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_ELECTRIFICATION,
          activityContact: [],
          initiative: { initiativeId: 'init-elec', code: 'ELECTRIFICATION' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      const result = await getProjectByProjectId(mockRepos, TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId);

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.electrificationProject.findFirst).toHaveBeenCalledWith({
        where: { electrificationProjectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId },
        include: expect.any(Object)
      });
    });

    it('should return general project when found by generalProjectId', async () => {
      const projectWithActivity = {
        ...TEST_GENERAL_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_GENERAL,
          activityContact: [],
          initiative: { initiativeId: 'init-gen', code: 'GENERAL' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      const result = await getProjectByProjectId(mockRepos, TEST_GENERAL_PROJECT_1.generalProjectId);

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.generalProject.findFirst).toHaveBeenCalledWith({
        where: { generalProjectId: TEST_GENERAL_PROJECT_1.generalProjectId },
        include: expect.any(Object)
      });
    });

    it('should return housing project when found by housingProjectId', async () => {
      const projectWithActivity = {
        ...TEST_HOUSING_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_HOUSING,
          activityContact: [],
          initiative: { initiativeId: 'init-hou', code: 'HOUSING' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(projectWithActivity as never);

      const result = await getProjectByProjectId(mockRepos, TEST_HOUSING_PROJECT_1.housingProjectId);

      expect(result).toEqual(projectWithActivity);
      expect(mockRepos.housingProject.findFirst).toHaveBeenCalledWith({
        where: { housingProjectId: TEST_HOUSING_PROJECT_1.housingProjectId },
        include: expect.any(Object)
      });
    });

    it('should throw 404 when project not found in any type', async () => {
      mockRepos.electrificationProject.findFirst.mockResolvedValue(null as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(null as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      await expect(getProjectByProjectId(mockRepos, 'MISSING_PROJECT_ID')).rejects.toThrow(Problem);

      try {
        await getProjectByProjectId(mockRepos, 'MISSING_PROJECT_ID');
      } catch (error) {
        expect((error as Problem).status).toBe(404);
      }
    });

    it('should throw 409 when projectId exists in multiple project types', async () => {
      const projectWithActivity = {
        ...TEST_ELECTRIFICATION_PROJECT_1,
        activity: {
          ...TEST_ACTIVITY_ELECTRIFICATION,
          activityContact: [],
          initiative: { initiativeId: 'init-elec', code: 'ELECTRIFICATION' }
        }
      };

      mockRepos.electrificationProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.generalProject.findFirst.mockResolvedValue(projectWithActivity as never);
      mockRepos.housingProject.findFirst.mockResolvedValue(null as never);

      await expect(getProjectByProjectId(mockRepos, 'PROJ_ID')).rejects.toThrow(Problem);

      try {
        await getProjectByProjectId(mockRepos, 'PROJ_ID');
      } catch (error) {
        expect((error as Problem).status).toBe(409);
      }
    });
  });
});
