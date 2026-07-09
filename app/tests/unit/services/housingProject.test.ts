import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_HOUSING_PROJECT_1,
  TEST_HOUSING_PROJECT_CREATE,
  TEST_HOUSING_PROJECT_INTAKE
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as housingProjectService from '../../../src/services/housingProject.ts';
import * as housingProjectDomain from '../../../src/domains/housingProject.ts';
import * as permitTrackingDomain from '../../../src/domains/permitTracking.ts';
import * as responseFiltering from '../../../src/parsers/responseFiltering.ts';
import prisma from '../../../src/db/database.ts';

vi.mock('config');
vi.mock('../../../src/db/database.ts', () => ({
  default: {
    $queryRaw: vi.fn()
  }
}));

const generateDataSpy = vi.spyOn(housingProjectDomain, 'generateHousingProjectData');
const emailSpy = vi.spyOn(housingProjectDomain, 'emailProjectConfirmation');
const upsertPermitTrackingSpy = vi.spyOn(permitTrackingDomain, 'upsertPermitTracking');
const filterSpy = vi.spyOn(responseFiltering, 'filterActivityResponseByScope');

describe('housingProject service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('createHousingProjectService', () => {
    it('calls generateHousingProjectData domain, creates project and permits, and returns result', async () => {
      const projectData = { ...TEST_HOUSING_PROJECT_CREATE, geoJson: JSON.stringify({}) };
      const generatedData = {
        housingProject: projectData,
        appliedPermits: [{ permitId: 'p1' }],
        investigatePermits: [{ permitId: 'p2' }],
        appliedPermitTrackers: [{ permitId: 'p1', permitTrackingId: 'pt1' }]
      };

      generateDataSpy.mockResolvedValueOnce(generatedData as never);
      mockRepos.housingProject.create.mockResolvedValueOnce(TEST_HOUSING_PROJECT_1 as never);
      mockRepos.permit.upsert.mockResolvedValue({} as never);
      upsertPermitTrackingSpy.mockResolvedValue(undefined as never);

      const response = await housingProjectService.createHousingProjectService(
        TEST_HOUSING_PROJECT_INTAKE,
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
        TEST_HOUSING_PROJECT_INTAKE,
        TEST_CURRENT_CONTEXT
      );
      expect(mockRepos.housingProject.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.create).toHaveBeenCalledWith(projectData);
      expect(mockRepos.permit.upsert).toHaveBeenCalledTimes(2);
      expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(TEST_HOUSING_PROJECT_1);
    });
  });

  describe('getHousingProjectService', () => {
    it('fetches housing project with includes', async () => {
      mockRepos.housingProject.findFirstOrThrow.mockResolvedValueOnce(TEST_HOUSING_PROJECT_1 as never);

      const response = await housingProjectService.getHousingProjectService(TEST_HOUSING_PROJECT_1.housingProjectId);

      expect(mockRepos.housingProject.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          housingProjectId: TEST_HOUSING_PROJECT_1.housingProjectId
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
      expect(response).toStrictEqual(TEST_HOUSING_PROJECT_1);
    });
  });

  describe('getHousingProjectStatisticsService', () => {
    it('executes raw query and transforms BigInt to Number', async () => {
      const mockDbResponse = [{ count: 5n, status: 'NEW' }];
      vi.mocked(prisma.$queryRaw).mockResolvedValueOnce(mockDbResponse as never);

      const filters = {
        dateFrom: '2024-01-01',
        dateTo: '2024-12-31',
        monthYear: '2024-01',
        userId: 'user-123'
      };

      const response = await housingProjectService.getHousingProjectStatisticsService(filters);

      expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
      expect(response).toEqual([{ count: 5, status: 'NEW' }]);
    });
  });

  describe('listHousingProjectActivityIdsService', () => {
    it('returns array of activity IDs', async () => {
      const mockIds = [{ activityId: 'id-1' }, { activityId: 'id-2' }];
      mockRepos.housingProject.findMany.mockResolvedValueOnce(mockIds as never);

      const response = await housingProjectService.listHousingProjectActivityIdsService();

      expect(mockRepos.housingProject.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.findMany).toHaveBeenCalledWith({ select: { activityId: true } });
      expect(response).toStrictEqual(['id-1', 'id-2']);
    });
  });

  describe('listHousingProjectsService', () => {
    it('fetches projects with includes and applies filtering', async () => {
      const mockProjects = [TEST_HOUSING_PROJECT_1];
      mockRepos.housingProject.findMany.mockResolvedValueOnce(mockProjects as never);
      filterSpy.mockResolvedValueOnce(mockProjects as never);

      const response = await housingProjectService.listHousingProjectsService(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.housingProject.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.findMany).toHaveBeenCalledWith({
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

  describe('searchHousingProjects', () => {
    it('searches projects and applies filtering', async () => {
      const mockProjects = [TEST_HOUSING_PROJECT_1];
      const searchParams = { activityId: ['id-1'] };
      mockRepos.housingProject.search.mockResolvedValueOnce(mockProjects as never);
      filterSpy.mockResolvedValueOnce(mockProjects as never);

      const response = await housingProjectService.searchHousingProjects(
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        TEST_CURRENT_CONTEXT,
        searchParams
      );

      expect(mockRepos.housingProject.search).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.search).toHaveBeenCalledWith(searchParams);
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

  describe('submitHousingProjectDraftService', () => {
    it('creates project from draft, creates permits, deletes draft, upserts contact, and sends email', async () => {
      const draftId = 'draft-123';
      const projectData = { ...TEST_HOUSING_PROJECT_CREATE, geoJson: JSON.stringify({}) };
      const generatedData = {
        housingProject: projectData,
        appliedPermits: [{ permitId: 'p1' }],
        investigatePermits: [{ permitId: 'p2' }],
        appliedPermitTrackers: [{ permitId: 'p1', permitTrackingId: 'pt1' }]
      };
      const contactResponse = { ...TEST_CONTACT_1, contactId: 'contact-1' };
      const projectResponse = { ...TEST_HOUSING_PROJECT_1, contact: contactResponse };

      generateDataSpy.mockResolvedValueOnce(generatedData as never);
      mockRepos.housingProject.create.mockResolvedValueOnce(projectResponse as never);
      mockRepos.permit.upsert.mockResolvedValue({} as never);
      upsertPermitTrackingSpy.mockResolvedValue(undefined as never);
      mockRepos.draft.delete.mockResolvedValueOnce({} as never);
      mockRepos.contact.upsert.mockResolvedValueOnce(contactResponse as never);
      emailSpy.mockResolvedValueOnce(undefined);

      const response = await housingProjectService.submitHousingProjectDraftService(
        draftId,
        TEST_HOUSING_PROJECT_INTAKE,
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
        TEST_HOUSING_PROJECT_INTAKE,
        TEST_CURRENT_CONTEXT
      );
      expect(mockRepos.housingProject.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.create).toHaveBeenCalledWith(projectData);
      expect(mockRepos.permit.upsert).toHaveBeenCalledTimes(2);
      expect(upsertPermitTrackingSpy).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.delete).toHaveBeenCalledTimes(1);
      expect(mockRepos.draft.delete).toHaveBeenCalledWith({ draftId });
      expect(mockRepos.contact.upsert).toHaveBeenCalledTimes(1);
      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        { contactId: TEST_CONTACT_1.contactId },
        TEST_CONTACT_1,
        TEST_CONTACT_1
      );
      expect(emailSpy).toHaveBeenCalledTimes(1);
      expect(emailSpy).toHaveBeenCalledWith(projectResponse);
      expect(response).toStrictEqual(projectResponse);
    });

    it('skips draft deletion when draftId is null', async () => {
      const projectData = { ...TEST_HOUSING_PROJECT_CREATE, geoJson: JSON.stringify({}) };
      const generatedData = {
        housingProject: projectData,
        appliedPermits: [],
        investigatePermits: [],
        appliedPermitTrackers: []
      };
      const contactResponse = { ...TEST_CONTACT_1, contactId: 'contact-1' };
      const projectResponse = { ...TEST_HOUSING_PROJECT_1, contact: contactResponse };

      generateDataSpy.mockResolvedValueOnce(generatedData as never);
      mockRepos.housingProject.create.mockResolvedValueOnce(projectResponse as never);
      mockRepos.contact.upsert.mockResolvedValueOnce(contactResponse as never);
      emailSpy.mockResolvedValueOnce(undefined);

      const response = await housingProjectService.submitHousingProjectDraftService(
        null,
        TEST_HOUSING_PROJECT_INTAKE,
        TEST_CONTACT_1,
        TEST_CURRENT_CONTEXT
      );

      expect(mockRepos.draft.delete).not.toHaveBeenCalled();
      expect(response).toStrictEqual(projectResponse);
    });
  });

  describe('updateHousingProjectService', () => {
    it('updates project and returns refetched project', async () => {
      const updateData = { submittedAt: new Date() };
      mockRepos.housingProject.update.mockResolvedValueOnce({} as never);
      mockRepos.housingProject.findFirstOrThrow.mockResolvedValueOnce(TEST_HOUSING_PROJECT_1 as never);

      const response = await housingProjectService.updateHousingProjectService(
        updateData,
        TEST_HOUSING_PROJECT_1.housingProjectId
      );

      expect(mockRepos.housingProject.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.update).toHaveBeenCalledWith(
        { housingProjectId: TEST_HOUSING_PROJECT_1.housingProjectId },
        updateData
      );
      expect(mockRepos.housingProject.findFirstOrThrow).toHaveBeenCalledTimes(1);
      expect(mockRepos.housingProject.findFirstOrThrow).toHaveBeenCalledWith({
        where: {
          housingProjectId: TEST_HOUSING_PROJECT_1.housingProjectId
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
      expect(response).toStrictEqual(TEST_HOUSING_PROJECT_1);
    });
  });
});
