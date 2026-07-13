import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { NoteHistoryRepository } from '../../../src/repositories/noteHistory.ts';
import { TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import { BringForwardType } from '../../../src/utils/enums/projectCommon.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { Mock } from 'vitest';

// Construct the real repo — its constructor picks tx.note_history, so prismaTxMock.note_history
// acts as the deep-mocked delegate. prismaMock setup resets it before each test.
const makeRepo = () => new NoteHistoryRepository(prismaTxMock, 'principal-id');

describe('NoteHistoryRepository', () => {
  let repo: NoteHistoryRepository;
  let findManyMock: Mock;

  beforeEach(() => {
    vi.clearAllMocks();

    repo = makeRepo();
    findManyMock = vi.spyOn(repo, 'findMany');
  });

  describe('listBringForwards', () => {
    it('builds where clause with initiative code and bring forward state', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listBringForwards(Initiative.HOUSING, BringForwardType.UNRESOLVED);

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          bringForwardState: BringForwardType.UNRESOLVED,
          activity: {
            initiative: {
              code: Initiative.HOUSING
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          noteHistoryId: true,
          activityId: true,
          createdBy: true,
          bringForwardDate: true,
          bringForwardState: true,
          escalateToSupervisor: true,
          escalateToDirector: true,
          title: true,
          activity: {
            select: {
              enquiry: {
                select: {
                  activityId: true,
                  enquiryId: true
                }
              },
              electrificationProject: {
                select: {
                  projectId: true,
                  projectName: true
                }
              },
              generalProject: {
                select: {
                  projectId: true,
                  projectName: true
                }
              },
              housingProject: {
                select: {
                  projectId: true,
                  projectName: true
                }
              }
            }
          },
          note: { orderBy: { createdAt: 'desc' } }
        }
      });
    });

    it('builds where clause with undefined initiative code', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listBringForwards(undefined, BringForwardType.RESOLVED);

      expect(findManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            bringForwardState: BringForwardType.RESOLVED,
            activity: {
              initiative: {
                code: undefined
              }
            }
          }
        })
      );
    });

    it('orders results by createdAt descending', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listBringForwards(Initiative.ELECTRIFICATION, BringForwardType.UNRESOLVED);

      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('returns the resolved value from findMany', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      const result = await repo.listBringForwards(Initiative.HOUSING, BringForwardType.UNRESOLVED);

      expect(result).toEqual([TEST_NOTE_HISTORY_1]);
    });

    it('handles empty results', async () => {
      findManyMock.mockResolvedValueOnce([]);

      const result = await repo.listBringForwards(Initiative.HOUSING, BringForwardType.UNRESOLVED);

      expect(result).toEqual([]);
      expect(findManyMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('listNoteHistories', () => {
    it('builds where clause filtering by activityId', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listNoteHistories('ACTI1234');

      expect(findManyMock).toHaveBeenCalledTimes(1);
      expect(findManyMock).toHaveBeenCalledWith({
        where: {
          activityId: 'ACTI1234'
        },
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          note: { orderBy: { createdAt: 'desc' } }
        }
      });
    });

    it('orders results by createdAt descending', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listNoteHistories('ACTI1234');

      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('includes the note relation ordered by createdAt descending', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      await repo.listNoteHistories('ACTI1234');

      const callArgs = findManyMock.mock.calls[0][0];
      expect(callArgs.include).toEqual({
        note: { orderBy: { createdAt: 'desc' } }
      });
    });

    it('returns the resolved value from findMany', async () => {
      findManyMock.mockResolvedValueOnce([TEST_NOTE_HISTORY_1 as never]);

      const result = await repo.listNoteHistories('ACTI1234');

      expect(result).toEqual([TEST_NOTE_HISTORY_1]);
    });

    it('handles empty results', async () => {
      findManyMock.mockResolvedValueOnce([]);

      const result = await repo.listNoteHistories('ACTI1234');

      expect(result).toEqual([]);
      expect(findManyMock).toHaveBeenCalledTimes(1);
    });
  });
});
