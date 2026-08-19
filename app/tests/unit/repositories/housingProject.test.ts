import { TEST_HOUSING_PROJECT_1 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { HousingProjectRepository } from '#src/repositories/housingProject';
import { SubmissionType } from '#src/utils/enums/projectCommon';

import type { Mock } from 'vitest';

// Construct the real repo — its constructor picks tx.housing_project, so prismaTxMock.housing_project
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new HousingProjectRepository(prismaTxMock, 'principal-id');

describe('HousingProjectRepository', () => {
  let repo: HousingProjectRepository;
  let findManyMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = makeRepo();
    findManyMock = vi.spyOn(repo, 'findMany');
  });

  describe('search', () => {
    it('builds where clause with all search parameter filters', async () => {
      findManyMock.mockResolvedValueOnce([TEST_HOUSING_PROJECT_1 as never]);

      const params = {
        activityId: ['ACTI1234', 'ACTI5678'],
        createdBy: ['user-1', 'user-2'],
        housingProjectId: ['project-1'],
        submissionType: [SubmissionType.GUIDANCE]
      };

      await repo.search(params);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: ['ACTI1234', 'ACTI5678'] } },
            { createdBy: { in: ['user-1', 'user-2'] } },
            { housingProjectId: { in: ['project-1'] } },
            { submissionType: { in: [SubmissionType.GUIDANCE] } }
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

    it('includes user relation when includeUser is true', async () => {
      findManyMock.mockResolvedValueOnce([TEST_HOUSING_PROJECT_1 as never]);

      const params = {
        activityId: ['ACTI1234'],
        createdBy: [],
        housingProjectId: [],
        submissionType: [],
        includeUser: true
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
            },
            user: true
          }
        })
      );
    });

    it('does not include user when includeUser is not provided', async () => {
      findManyMock.mockResolvedValueOnce([TEST_HOUSING_PROJECT_1 as never]);

      const params = {
        activityId: [],
        createdBy: [],
        housingProjectId: [],
        submissionType: []
      };

      await repo.search(params);

      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.include.user).toBeUndefined();
    });

    it('handles empty filter arrays', async () => {
      findManyMock.mockResolvedValueOnce([]);

      const params = {
        activityId: [],
        createdBy: [],
        housingProjectId: [],
        submissionType: []
      };

      const result = await repo.search(params);

      expect(result).toEqual([]);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            { activityId: { in: [] } },
            { createdBy: { in: [] } },
            { housingProjectId: { in: [] } },
            { submissionType: { in: [] } }
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
  });
});
