import { TEST_CURRENT_CONTEXT, TEST_DOCUMENT_1 } from '../data/index.ts';
import {
  createDocumentController,
  deleteDocumentController,
  listDocumentsController
} from '../../../src/controllers/document.ts';
import * as documentService from '../../../src/services/document.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

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
});

describe('createDocumentController', () => {
  const createSpy = vi.spyOn(documentService, 'createDocumentService');

  it('calls the service with document data then responds 201', async () => {
    const req = {
      body: {
        documentId: 'doc-123',
        activityId: 'acti-456',
        filename: 'test.pdf',
        mimeType: 'application/pdf',
        filesize: 1024
      }
    } as unknown as Request<
      never,
      never,
      { documentId: string; activityId: string; filename: string; mimeType: string; filesize: number }
    >;

    createSpy.mockResolvedValue(TEST_DOCUMENT_1);

    await createDocumentController(req, res as unknown as Response);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.filesize
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_DOCUMENT_1);
  });
});

describe('deleteDocumentController', () => {
  const deleteSpy = vi.spyOn(documentService, 'deleteDocumentService');

  it('calls the service with documentId then responds 204', async () => {
    const req = {
      params: { documentId: 'doc-123' }
    } as unknown as Request<{ documentId: string }>;

    deleteSpy.mockResolvedValue(undefined);

    await deleteDocumentController(req, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.documentId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('listDocumentsController', () => {
  const listSpy = vi.spyOn(documentService, 'listDocumentsService');

  it('calls the service with activityId then responds 200', async () => {
    const req = {
      params: { activityId: 'acti-456' }
    } as unknown as Request<{ activityId: string }>;

    listSpy.mockResolvedValue([TEST_DOCUMENT_1]);

    await listDocumentsController(req, res as unknown as Response);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_DOCUMENT_1]);
  });
});
