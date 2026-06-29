import { TEST_CURRENT_CONTEXT, TEST_DOCUMENT_1, TEST_IDIR_USER_1 } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import {
  createDocumentController,
  deleteDocumentController,
  listDocumentsController
} from '../../../src/controllers/document.ts';
import * as documentService from '../../../src/services/document.ts';
import * as userService from '../../../src/services/user.ts';

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
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('createDocumentController', () => {
  const createSpy = vi.spyOn(documentService, 'createDocument');
  const readUserSpy = vi.spyOn(userService, 'readUser');

  it('should call services and respond with 201 and result', async () => {
    const req = {
      body: {
        documentId: 'fdbe13d4-e90f-4119-9b10-d5ed08ad1d6d',
        activityId: 'ACTI1234',
        filename: 'testfile',
        mimeType: 'imgjpg',
        filesize: 1234567
      }
    };

    createSpy.mockResolvedValue(TEST_DOCUMENT_1);

    await createDocumentController(
      req as unknown as Request<
        never,
        never,
        { documentId: string; activityId: string; filename: string; mimeType: string; filesize: number }
      >,
      res as unknown as Response
    );

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      prismaTxMock,
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.filesize,
      { createdAt: expect.any(Date) as Date, createdBy: TEST_CURRENT_CONTEXT.userId }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_DOCUMENT_1);
  });

  it('adds createdByFullName', async () => {
    const req = {
      body: {
        documentId: 'fdbe13d4-e90f-4119-9b10-d5ed08ad1d6d',
        activityId: 'ACTI1234',
        filename: 'testfile',
        mimeType: 'imgjpg',
        filesize: 1234567
      }
    };

    const DOC = { ...TEST_DOCUMENT_1, createdBy: TEST_IDIR_USER_1.userId };

    createSpy.mockResolvedValue(DOC);
    readUserSpy.mockResolvedValue(TEST_IDIR_USER_1);

    await createDocumentController(
      req as unknown as Request<
        never,
        never,
        { documentId: string; activityId: string; filename: string; mimeType: string; filesize: number }
      >,
      res as unknown as Response
    );

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      prismaTxMock,
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.filesize,
      { createdAt: expect.any(Date) as Date, createdBy: TEST_CURRENT_CONTEXT.userId }
    );
    expect(readUserSpy).toHaveBeenCalledTimes(1);
    expect(readUserSpy).toHaveBeenCalledWith(prismaTxMock, DOC.createdBy);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ...DOC, createdByFullName: TEST_IDIR_USER_1.fullName });
  });
});

describe('deleteDocumentController', () => {
  const deleteSpy = vi.spyOn(documentService, 'deleteDocument');

  it('should call services and respond with 204', async () => {
    const req = {
      params: { documentId: 'fdbe13d4-e90f-4119-9b10-d5ed08ad1d6d' }
    };

    deleteSpy.mockResolvedValue();

    await deleteDocumentController(req as unknown as Request<{ documentId: string }>, res as unknown as Response);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(prismaTxMock, req.params.documentId, {
      deletedAt: expect.any(Date) as Date,
      deletedBy: TEST_CURRENT_CONTEXT.userId
    });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});

describe('listDocumentsController', () => {
  const listSpy = vi.spyOn(documentService, 'listDocuments');
  const readUserSpy = vi.spyOn(userService, 'readUser');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      params: { activityId: 'ACTI1234' }
    };

    listSpy.mockResolvedValue([TEST_DOCUMENT_1]);

    await listDocumentsController(req as unknown as Request<{ activityId: string }>, res as unknown as Response);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_DOCUMENT_1]);
  });

  it('adds createdByFullName', async () => {
    const req = {
      params: { activityId: 'ACTI1234' }
    };

    const DOC = { ...TEST_DOCUMENT_1, createdBy: TEST_IDIR_USER_1.userId };

    listSpy.mockResolvedValue([DOC]);
    readUserSpy.mockResolvedValue(TEST_IDIR_USER_1);

    await listDocumentsController(req as unknown as Request<{ activityId: string }>, res as unknown as Response);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(prismaTxMock, req.params.activityId);
    expect(readUserSpy).toHaveBeenCalledTimes(1);
    expect(readUserSpy).toHaveBeenCalledWith(prismaTxMock, DOC.createdBy);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([{ ...DOC, createdByFullName: TEST_IDIR_USER_1.fullName }]);
  });
});
