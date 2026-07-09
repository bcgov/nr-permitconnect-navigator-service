import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { ElectrificationProjectRepository } from '../../../src/repositories/electrificationProject.ts';
import { TEST_ELECTRIFICATION_PROJECT_1 } from '../data/index.ts';

import type { Mock } from 'vitest';

// Construct the real repo — its constructor picks tx.electrification_project, so prismaTxMock.electrification_project
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new ElectrificationProjectRepository(prismaTxMock, 'principal-id');

describe('ElectrificationProjectRepository', () => {
  let repo: ElectrificationProjectRepository;
  let findManyMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = makeRepo();
    findManyMock = vi.spyOn(repo, 'findMany');
  });

  describe('search', () => {
    it('builds where clause with all search parameter filters', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ELECTRIFICATION_PROJECT_1]);

      const params = {
        activityId: ['act-1', 'act-2'],
        createdBy: ['user-1'],
        electrificationProjectId: ['elec-1'],
        projectType: ['RESIDENTIAL'],
        projectCategory: ['UPGRADE']
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: ['act-1', 'act-2'] } },
            { createdBy: { in: ['user-1'] } },
            { electrificationProjectId: { in: ['elec-1'] } },
            { projectType: { in: ['RESIDENTIAL'] } },
            { projectCategory: { in: ['UPGRADE'] } }
          ]
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
          },
          user: undefined
        }
      });
    });

    it('includes user in the result when includeUser is true', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ELECTRIFICATION_PROJECT_1]);

      const params = {
        activityId: [],
        createdBy: [],
        electrificationProjectId: [],
        projectType: [],
        projectCategory: [],
        includeUser: true
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ user: true })
        })
      );
    });

    it('does not include user when includeUser is not provided', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ELECTRIFICATION_PROJECT_1]);

      const params = {
        activityId: [],
        createdBy: [],
        electrificationProjectId: [],
        projectType: [],
        projectCategory: []
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ user: undefined })
        })
      );
    });

    it('includes activity with nested activityContact and contact', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ELECTRIFICATION_PROJECT_1]);

      const params = {
        activityId: [],
        createdBy: [],
        electrificationProjectId: [],
        projectType: [],
        projectCategory: []
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
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
        })
      );
    });

    it('passes all params including optional user filter and returns the result', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ELECTRIFICATION_PROJECT_1]);

      const params = {
        activityId: ['act-1'],
        createdBy: ['user-1'],
        electrificationProjectId: ['elec-1'],
        projectType: ['RESIDENTIAL'],
        projectCategory: ['UPGRADE'],
        includeUser: true
      };

      const result = await repo.search(params);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: ['act-1'] } },
            { createdBy: { in: ['user-1'] } },
            { electrificationProjectId: { in: ['elec-1'] } },
            { projectType: { in: ['RESIDENTIAL'] } },
            { projectCategory: { in: ['UPGRADE'] } }
          ]
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
          },
          user: true
        }
      });
      expect(result).toStrictEqual([TEST_ELECTRIFICATION_PROJECT_1]);
    });
  });
});
