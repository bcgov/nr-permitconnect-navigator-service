import { TEST_CURRENT_CONTEXT, TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { generateDeleteStamps } from '../../../src/db/utils/utils.ts';
import * as noteHistoryService from '../../../src/services/noteHistory.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';
import { BringForwardType } from '../../../src/utils/enums/projectCommon.ts';

describe('createNoteHistory', () => {
  it('calls note_history.create and returns result', async () => {
    prismaTxMock.note_history.create.mockResolvedValueOnce(TEST_NOTE_HISTORY_1);

    const response = await noteHistoryService.createNoteHistory(prismaTxMock, TEST_NOTE_HISTORY_1);

    expect(prismaTxMock.note_history.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(TEST_NOTE_HISTORY_1);
  });
});

describe('deleteNoteHistory', () => {
  it('calls note_history.update', async () => {
    prismaTxMock.note_history.update.mockResolvedValueOnce(TEST_NOTE_HISTORY_1);

    await noteHistoryService.deleteNoteHistory(prismaTxMock, '1', generateDeleteStamps(TEST_CURRENT_CONTEXT));

    expect(prismaTxMock.note_history.delete).not.toHaveBeenCalled();
    expect(prismaTxMock.note_history.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.note_history.update).toHaveBeenCalledWith({
      data: { deletedAt: expect.any(Date), deletedBy: TEST_CURRENT_CONTEXT.userId },
      where: { noteHistoryId: '1' }
    });
  });
});

describe('getNoteHistory', () => {
  it('calls note_history.findFirstOrThrow and returns result', async () => {
    prismaTxMock.note_history.findFirstOrThrow.mockResolvedValueOnce(TEST_NOTE_HISTORY_1);

    const response = await noteHistoryService.getNoteHistory(prismaTxMock, '1');

    expect(prismaTxMock.note_history.findFirstOrThrow).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.note_history.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        noteHistoryId: '1'
      },
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
    expect(response).toStrictEqual(TEST_NOTE_HISTORY_1);
  });
});

describe('listBringForward', () => {
  it('calls note_history.findMany and returns result', async () => {
    prismaTxMock.note_history.findMany.mockResolvedValueOnce([TEST_NOTE_HISTORY_1]);

    const response = await noteHistoryService.listBringForward(
      prismaTxMock,
      Initiative.HOUSING,
      BringForwardType.UNRESOLVED
    );

    expect(prismaTxMock.note_history.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.note_history.findMany).toHaveBeenCalledWith({
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
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
    expect(response).toStrictEqual([TEST_NOTE_HISTORY_1]);
  });
});

describe('listNoteHistory', () => {
  it('calls note_history.findMany and returns result', async () => {
    prismaTxMock.note_history.findMany.mockResolvedValueOnce([TEST_NOTE_HISTORY_1]);

    const response = await noteHistoryService.listNoteHistory(prismaTxMock, '1');

    expect(prismaTxMock.note_history.findMany).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.note_history.findMany).toHaveBeenCalledWith({
      where: {
        activityId: '1'
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        note: { orderBy: { createdAt: 'desc' } }
      }
    });
    expect(response).toStrictEqual([TEST_NOTE_HISTORY_1]);
  });
});

describe('updateNoteHistory', () => {
  it('calls note_history.update with correct data and returns result', async () => {
    prismaTxMock.note_history.update.mockResolvedValueOnce(TEST_NOTE_HISTORY_1);

    const response = await noteHistoryService.updateNoteHistory(prismaTxMock, TEST_NOTE_HISTORY_1);

    expect(prismaTxMock.note_history.update).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.note_history.update).toHaveBeenCalledWith({
      data: TEST_NOTE_HISTORY_1,
      where: {
        noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId
      }
    });
    expect(response).toStrictEqual(TEST_NOTE_HISTORY_1);
  });
});
