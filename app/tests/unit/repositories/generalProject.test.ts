import { TEST_GENERAL_PROJECT_1 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { GeneralProjectRepository } from '#src/repositories/generalProject';

import type { Mock } from 'vitest';

// Construct the real repo — its constructor picks tx.general_project, so prismaTxMock.general_project
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new GeneralProjectRepository(prismaTxMock, 'principal-id');

describe('GeneralProjectRepository', () => {
  let repo: GeneralProjectRepository;
  let findManyMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = makeRepo();
    findManyMock = vi.spyOn(repo, 'findMany');
  });

  describe('search', () => {
    it('builds where clause with all search parameter filters', async () => {
      findManyMock.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1 as never]);

      const params = {
        activityId: ['act-1', 'act-2'],
        createdBy: ['user-1'],
        generalProjectId: ['gen-1'],
        submissionType: ['NEW']
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: ['act-1', 'act-2'] } },
            { createdBy: { in: ['user-1'] } },
            { generalProjectId: { in: ['gen-1'] } },
            { submissionType: { in: ['NEW'] } }
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
      findManyMock.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1 as never]);

      const params = {
        activityId: [],
        createdBy: [],
        generalProjectId: [],
        submissionType: [],
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
      findManyMock.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1 as never]);

      const params = {
        activityId: [],
        createdBy: [],
        generalProjectId: [],
        submissionType: []
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ user: undefined })
        })
      );
    });

    it('includes activity with nested activityContact and contact', async () => {
      findManyMock.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1 as never]);

      const params = {
        activityId: [],
        createdBy: [],
        generalProjectId: [],
        submissionType: []
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
      findManyMock.mockResolvedValueOnce([TEST_GENERAL_PROJECT_1 as never]);

      const params = {
        activityId: ['act-1'],
        createdBy: ['user-1'],
        generalProjectId: ['gen-1'],
        submissionType: ['NEW'],
        includeUser: true
      };

      const result = await repo.search(params);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: ['act-1'] } },
            { createdBy: { in: ['user-1'] } },
            { generalProjectId: { in: ['gen-1'] } },
            { submissionType: { in: ['NEW'] } }
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
      expect(result).toStrictEqual([TEST_GENERAL_PROJECT_1]);
    });
  });
});
