import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_ELECTRIFICATION_INTAKE,
  TEST_ELECTRIFICATION_PROJECT_1
} from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import prisma from '#src/db/database';
import * as electrificationProjectDomain from '#src/domains/electrificationProject';
import * as projectDomain from '#src/domains/project';
import * as responseFiltering from '#src/parsers/responseFiltering';
import * as electrificationProjectService from '#src/services/electrificationProject';
import { Initiative } from '#src/utils/enums/application';
import { confirmationTemplateElectrificationSubmission } from '#src/utils/templates';

vi.mock('config');
vi.mock('../../../src/db/database.ts', () => ({
  default: {
    $queryRaw: vi.fn()
  }
}));

const generateDataSpy = vi.spyOn(electrificationProjectDomain, 'generateElectrificationProjectData');
const emailSpy = vi.spyOn(projectDomain, 'emailProjectConfirmation');
const filterSpy = vi.spyOn(responseFiltering, 'filterActivityResponseByScope');

describe('electrificationProject service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createElectrificationProjectService', () => {
    it('calls generateElectrificationProjectData domain, creates project, and returns result', async () => {
      generateDataSpy.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1);
      mockRepos.electrificationProject.create.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1 as never);

      const response = await electrificationProjectService.createElectrificationProjectService(
        TEST_ELECTRIFICATION_INTAKE,
        TEST_CURRENT_CONTEXT
      );

      expect(generateDataSpy).toHaveBeenCalledTimes(1);
      expect(generateDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: mockRepos.activity,
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact,
          initiative: mockRepos.initiative
        }),
        TEST_ELECTRIFICATION_INTAKE,
        TEST_CURRENT_CONTEXT
      );
      expect(mockRepos.electrificationProject.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.create).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1);
      expect(response).toStrictEqual(TEST_ELECTRIFICATION_PROJECT_1);
    });
  });

  describe('getElectrificationProjectService', () => {
    it('fetches electrification project with includes', async () => {
      mockRepos.electrificationProject.findFirstOrThrow.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1 as never);

      const response = await electrificationProjectService.getElectrificationProjectService(
        TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
      );

      expect(mockRepos.electrificationProject.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          electrificationProjectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
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
      expect(response).toStrictEqual(TEST_ELECTRIFICATION_PROJECT_1);
    });
  });

  describe('getElectrificationProjectStatisticsService', () => {
    it('executes raw query and transforms BigInt to Number', async () => {
      const mockDbResponse = [{ count: 5n, status: 'NEW' }];
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockDbResponse as never);

      const filters = {
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-12-31'),
        monthYear: new Date('2024-01-01'),
        userId: 'user-123'
      };

      const response = await electrificationProjectService.getElectrificationProjectStatisticsService(filters);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      // Ensure BigInt (5n) was correctly serialized to a standard Number (5)
      expect(response).toEqual([{ count: 5, status: 'NEW' }]);
    });
  });

  describe('listElectrificationProjectActivityIdsService', () => {
    it('returns array of activity IDs', async () => {
      const mockIds = [{ activityId: 'id-1' }, { activityId: 'id-2' }];
      mockRepos.electrificationProject.findMany.mockResolvedValueOnce(mockIds as never);

      const response = await electrificationProjectService.listElectrificationProjectActivityIdsService();

      expect(mockRepos.electrificationProject.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.findMany).toHaveBeenCalledWith({ select: { activityId: true } });
      expect(response).toStrictEqual(['id-1', 'id-2']);
    });
  });

  describe('listElectrificationProjectsService', () => {
    it('fetches projects with includes and applies filtering', async () => {
      const mockProjects = [TEST_ELECTRIFICATION_PROJECT_1];
      mockRepos.electrificationProject.findMany.mockResolvedValueOnce(mockProjects as never);
      filterSpy.mockResolvedValueOnce(mockProjects as never);

      const response = await electrificationProjectService.listElectrificationProjectsService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.electrificationProject.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.findMany).toHaveBeenCalledWith({
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
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact
        }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        mockProjects
      );
      expect(response).toStrictEqual(mockProjects);
    });
  });

  describe('searchElectrificationProjects', () => {
    it('searches projects and applies filtering', async () => {
      const mockProjects = [TEST_ELECTRIFICATION_PROJECT_1];
      const searchParams = { activityId: ['id-1'] };
      mockRepos.electrificationProject.search.mockResolvedValueOnce(mockProjects as never);
      filterSpy.mockResolvedValueOnce(mockProjects as never);

      const response = await electrificationProjectService.searchElectrificationProjects(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        searchParams
      );

      expect(mockRepos.electrificationProject.search).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.search).toHaveBeenCalledWith(searchParams);
      expect(filterSpy).toHaveBeenCalledTimes(1);
      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact
        }),
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        mockProjects
      );
      expect(response).toStrictEqual(mockProjects);
    });
  });

  describe('submitElectrificationProjectDraftService', () => {
    it('creates project from draft, deletes draft, upserts contact, and sends email', async () => {
      const draftId = 'draft-123';
      const contactResponse = { ...TEST_CONTACT_1, contactId: 'contact-1' };
      const projectResponse = { ...TEST_ELECTRIFICATION_PROJECT_1, contact: contactResponse };

      generateDataSpy.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1);
      mockRepos.electrificationProject.create.mockResolvedValueOnce(projectResponse as never);
      mockRepos.draft.delete.mockResolvedValueOnce({} as never);
      mockRepos.contact.upsert.mockResolvedValueOnce(contactResponse as never);
      emailSpy.mockResolvedValueOnce(undefined);

      const response = await electrificationProjectService.submitElectrificationProjectDraftService(
        draftId,
        TEST_ELECTRIFICATION_INTAKE,
        TEST_CONTACT_1,
        TEST_CURRENT_CONTEXT
      );

      expect(generateDataSpy).toHaveBeenCalledTimes(1);
      expect(generateDataSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          activity: mockRepos.activity,
          activityContact: mockRepos.activityContact,
          contact: mockRepos.contact,
          initiative: mockRepos.initiative
        }),
        TEST_ELECTRIFICATION_INTAKE,
        TEST_CURRENT_CONTEXT
      );
      expect(mockRepos.electrificationProject.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.create).toHaveBeenCalledWith(TEST_ELECTRIFICATION_PROJECT_1);
      expect(mockRepos.draft.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.delete).toHaveBeenCalledWith({ draftId });
      expect(mockRepos.contact.upsert).toHaveBeenCalledTimes(1);
      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        { contactId: TEST_CONTACT_1.contactId },
        TEST_CONTACT_1,
        TEST_CONTACT_1
      );
      expect(emailSpy).toHaveBeenCalledTimes(1);
      expect(emailSpy).toHaveBeenCalledWith(
        Initiative.ELECTRIFICATION,
        projectResponse.activityId,
        projectResponse.electrificationProjectId,
        confirmationTemplateElectrificationSubmission,
        projectResponse.contact
      );
      expect(response).toStrictEqual(projectResponse);
    });

    it('skips draft deletion when draftId is null', async () => {
      const contactResponse = { ...TEST_CONTACT_1, contactId: 'contact-1' };
      const projectResponse = { ...TEST_ELECTRIFICATION_PROJECT_1, contact: contactResponse };

      generateDataSpy.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1);
      mockRepos.electrificationProject.create.mockResolvedValueOnce(projectResponse as never);
      mockRepos.contact.upsert.mockResolvedValueOnce(contactResponse as never);
      emailSpy.mockResolvedValueOnce(undefined);

      const response = await electrificationProjectService.submitElectrificationProjectDraftService(
        null,
        TEST_ELECTRIFICATION_INTAKE,
        TEST_CONTACT_1,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.draft.delete).not.toHaveBeenCalled();
      expect(response).toStrictEqual(projectResponse);
    });
  });

  describe('patchElectrificationProjectService', () => {
    it('updates project and returns refetched project', async () => {
      const updateData = {
        projectName: 'Updated Name'
      };
      mockRepos.electrificationProject.update.mockResolvedValueOnce({} as never);
      mockRepos.electrificationProject.findFirstOrThrow.mockResolvedValueOnce(TEST_ELECTRIFICATION_PROJECT_1 as never);

      const response = await electrificationProjectService.patchElectrificationProjectService(
        TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId,
        updateData
      );

      expect(mockRepos.electrificationProject.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.update).toHaveBeenCalledWith(
        { electrificationProjectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId },
        { projectName: updateData.projectName }
      );
      expect(mockRepos.electrificationProject.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.electrificationProject.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          electrificationProjectId: TEST_ELECTRIFICATION_PROJECT_1.electrificationProjectId
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
      expect(response).toStrictEqual(TEST_ELECTRIFICATION_PROJECT_1);
    });
  });
});
