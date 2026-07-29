import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { getRoadmapNoteController, sendRoadmapController } from '../../../src/controllers/roadmap.ts';
import * as roadmapService from '../../../src/services/roadmap.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { Email } from '../../../src/types';

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
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  vi.clearAllMocks();
});

describe('getRoadmapNoteController', () => {
  it('should call service with activityId and respond with 200', async () => {
    const mockNoteData = { noteHistoryId: 'nh-1', type: 'ROADMAP_NOTE', note: [{ noteId: 'n-1', note: 'Test note' }] };
    vi.spyOn(roadmapService, 'getRoadmapNoteService').mockResolvedValueOnce(mockNoteData as never);

    const req = { query: { activityId: 'activity-123' } } as unknown as Request<
      never,
      never,
      never,
      { activityId: string }
    >;

    await getRoadmapNoteController(req, res as unknown as Response);

    expect(roadmapService.getRoadmapNoteService).toHaveBeenCalledTimes(1);
    expect(roadmapService.getRoadmapNoteService).toHaveBeenCalledWith('activity-123');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockNoteData);
  });
});

describe('sendRoadmapController', () => {
  it('should call service with extracted args and respond with 201', async () => {
    const mockResult = {
      noteHistoryId: 'nh-1',
      type: 'ROADMAP_NOTE',
      note: [{ noteId: 'n-1', note: 'Roadmap note' }]
    };
    vi.spyOn(roadmapService, 'sendRoadmapService').mockResolvedValueOnce(mockResult as never);

    const emailData: Email = {
      body: 'Test email body',
      bodyType: 'text',
      from: 'test@example.com',
      to: ['recipient@example.com'],
      subject: 'Test Subject'
    };

    const req = {
      body: {
        activityId: 'activity-123',
        selectedFileIds: ['file-1', 'file-2'],
        emailData
      }
    } as unknown as Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>;

    await sendRoadmapController(req, res as unknown as Response);

    expect(roadmapService.sendRoadmapService).toHaveBeenCalledTimes(1);
    expect(roadmapService.sendRoadmapService).toHaveBeenCalledWith(
      TEST_CURRENT_CONTEXT,
      'activity-123',
      ['file-1', 'file-2'],
      emailData
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });
});
