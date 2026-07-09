import { TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, TEST_CURRENT_CONTEXT, TEST_NOTE_HISTORY_1 } from '../data/index.ts';
import {
  createNoteHistoryController,
  deleteNoteHistoryController,
  listBringForwardsController,
  listNoteHistoriesController,
  updateNoteHistoryController
} from '../../../src/controllers/noteHistory.ts';
import * as noteHistoryService from '../../../src/services/noteHistory.ts';
import { Resource } from '../../../src/utils/enums/application.ts';
import { BringForwardType } from '../../../src/utils/enums/projectCommon.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { LocalContext, NoteHistory } from '../../../src/types/index.ts';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  res.locals.currentAuthorization = TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR;
});

describe('createNoteHistoryController', () => {
  const createSpy = vi.spyOn(noteHistoryService, 'createNoteHistoryService');

  it('calls the service with note history data then responds 201', async () => {
    const req = {
      body: {
        ...TEST_NOTE_HISTORY_1,
        note: 'test note text'
      }
    } as unknown as Request<never, never, NoteHistory & { note: string }>;

    createSpy.mockResolvedValue(TEST_NOTE_HISTORY_1);

    await createNoteHistoryController(req, res as unknown as Response);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining(TEST_NOTE_HISTORY_1), 'test note text');
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_NOTE_HISTORY_1);
  });
});

describe('deleteNoteHistoryController', () => {
  const deleteSpy = vi.spyOn(noteHistoryService, 'deleteNoteHistoryService');

  it('calls the service with noteHistoryId then responds 204', async () => {
    const req = {
      params: { noteHistoryId: 'nh-123' }
    } as unknown as Request<{ noteHistoryId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteNoteHistoryController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.noteHistoryId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('listBringForwardsController', () => {
  const listSpy = vi.spyOn(noteHistoryService, 'listBringForwardsService');

  it('calls the service with initiative and bringForwardState then responds 200', async () => {
    const req = {
      query: { bringForwardState: BringForwardType.UNRESOLVED }
    } as unknown as Request<never, never, never, { bringForwardState?: BringForwardType }>;

    listSpy.mockResolvedValue([]);

    await listBringForwardsController(req, res as unknown as Response<unknown, LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT.initiative, BringForwardType.UNRESOLVED);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([]);
  });
});

describe('listNoteHistoriesController', () => {
  const listSpy = vi.spyOn(noteHistoryService, 'listNoteHistoriesService');

  it('calls the service with authorization and activityId then responds 200', async () => {
    const req = {
      params: { activityId: 'acti-456' }
    } as unknown as Request<{ activityId: string }>;

    listSpy.mockResolvedValue([TEST_NOTE_HISTORY_1]);

    await listNoteHistoriesController(req, res as unknown as Response<unknown, LocalContext>);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR, req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_NOTE_HISTORY_1]);
  });
});

describe('updateNoteHistoryController', () => {
  const updateSpy = vi.spyOn(noteHistoryService, 'updateNoteHistoryService');

  it('calls the service with history data and note then responds 200', async () => {
    const req = {
      params: { noteHistoryId: 'nh-123' },
      body: {
        ...TEST_NOTE_HISTORY_1,
        note: 'updated note',
        resource: Resource.ENQUIRY
      }
    } as unknown as Request<
      { noteHistoryId: string },
      never,
      NoteHistory & { note: string | undefined; resource: Resource }
    >;

    updateSpy.mockResolvedValue(TEST_NOTE_HISTORY_1);

    await updateNoteHistoryController(req, res as unknown as Response<unknown, LocalContext>);

    expect(updateSpy).toHaveBeenCalledTimes(1);
    expect(updateSpy).toHaveBeenCalledWith(
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT,
      expect.objectContaining({ noteHistoryId: TEST_NOTE_HISTORY_1.noteHistoryId }),
      'updated note',
      Resource.ENQUIRY
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_NOTE_HISTORY_1);
  });
});
