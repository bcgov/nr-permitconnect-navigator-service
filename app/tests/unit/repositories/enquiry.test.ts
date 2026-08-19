import { TEST_ENQUIRY_1 } from '#tests/unit/data/index';
import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { EnquiryRepository } from '#src/repositories/enquiry';
import { Initiative } from '#src/utils/enums/application';

import type { Mock } from 'vitest';

// Construct the real repo — its constructor picks tx.enquiry, so prismaTxMock.enquiry
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new EnquiryRepository(prismaTxMock, 'principal-id');

describe('EnquiryRepository', () => {
  let repo: EnquiryRepository;
  let findManyMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = makeRepo();
    findManyMock = vi.spyOn(repo, 'findMany');
  });

  describe('search', () => {
    it('uses initiative code in where clause when initiative is not PCNS', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      const result = await repo.search({}, Initiative.HOUSING);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              activity: {
                initiative: {
                  code: Initiative.HOUSING
                }
              }
            },
            {
              activityId: { in: undefined }
            },
            {
              createdBy: { in: undefined }
            },
            {
              enquiryId: { in: undefined }
            }
          ]
        },
        include: {
          activity: {
            include: {
              activityContact: {
                include: {
                  contact: true
                }
              },
              initiative: true
            }
          },
          user: undefined
        }
      });
      expect(result).toStrictEqual([TEST_ENQUIRY_1]);
    });

    it('sets initiative code to undefined when initiative is PCNS', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      await repo.search({}, Initiative.PCNS);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              {
                activity: {
                  initiative: {
                    code: undefined
                  }
                }
              }
            ])
          })
        })
      );
    });

    it('passes activityId, createdBy, and enquiryId filter arrays', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      const params = {
        activityId: ['act-1', 'act-2'],
        createdBy: ['user-1'],
        enquiryId: ['enq-1']
      };

      await repo.search(params, Initiative.HOUSING);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: expect.arrayContaining([
              { activityId: { in: ['act-1', 'act-2'] } },
              { createdBy: { in: ['user-1'] } },
              { enquiryId: { in: ['enq-1'] } }
            ])
          }
        })
      );
    });

    it('includes user in the result when includeUser is true', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      await repo.search({ includeUser: true }, Initiative.HOUSING);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({ user: true })
        })
      );
    });

    it('passes all params and returns the result', async () => {
      findManyMock.mockResolvedValueOnce([TEST_ENQUIRY_1]);

      const params = {
        activityId: ['act-1'],
        createdBy: ['user-1'],
        enquiryId: ['enq-1'],
        includeUser: true
      };

      const result = await repo.search(params, Initiative.HOUSING);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          AND: [
            {
              activity: {
                initiative: {
                  code: Initiative.HOUSING
                }
              }
            },
            {
              activityId: { in: params.activityId }
            },
            {
              createdBy: { in: params.createdBy }
            },
            {
              enquiryId: { in: params.enquiryId }
            }
          ]
        },
        include: {
          activity: {
            include: {
              activityContact: {
                include: {
                  contact: true
                }
              },
              initiative: true
            }
          },
          user: params.includeUser
        }
      });
      expect(result).toStrictEqual([TEST_ENQUIRY_1]);
    });
  });
});
