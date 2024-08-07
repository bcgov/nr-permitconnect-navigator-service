import { NIL } from 'uuid';

import { documentController } from '../../../src/controllers';
import { documentService, userService } from '../../../src/services';
import * as utils from '../../../src/utils/utils';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  jest.resetAllMocks();
});

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null };

describe('createDocument', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(documentService, 'createDocument');
  const getCurrentIdentitySpy = jest.spyOn(utils, 'getCurrentIdentity');
  const getCurrentUserIdSpy = jest.spyOn(userService, 'getCurrentUserId');

  it('should return 201 if all good', async () => {
    const req = {
      body: { documentId: 'abc123', activityId: '1', filename: 'testfile', mimeType: 'imgjpg', length: 1234567 },
      currentContext: CURRENT_CONTEXT
    };

    const created = {
      documentId: 'abc123',
      activityId: '1',
      filename: 'testfile',
      mimeType: 'imgjpg',
      filesize: 1234567,
      createdByFullName: 'testuser'
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    createSpy.mockResolvedValue(created);
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.createDocument(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_CONTEXT, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.length,
      USR_ID
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('calls next if the document service fails to create', async () => {
    const req = {
      body: { documentId: 'abc123', activityId: '1', filename: 'testfile', mimeType: 'imgjpg', length: 1234567 },
      currentContext: CURRENT_CONTEXT
    };

    const USR_IDENTITY = 'xxxy';
    const USR_ID = 'abc-123';

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });
    getCurrentIdentitySpy.mockReturnValue(USR_IDENTITY);
    getCurrentUserIdSpy.mockResolvedValue(USR_ID);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.createDocument(req as any, res as any, next);

    expect(getCurrentIdentitySpy).toHaveBeenCalledTimes(1);
    expect(getCurrentIdentitySpy).toHaveBeenCalledWith(CURRENT_CONTEXT, NIL);
    expect(getCurrentUserIdSpy).toHaveBeenCalledTimes(1);
    expect(getCurrentUserIdSpy).toHaveBeenCalledWith(USR_IDENTITY, NIL);
    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.length,
      USR_ID
    );
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('deleteDocument', () => {
  const next = jest.fn();

  // Mock service calls
  const deleteSpy = jest.spyOn(documentService, 'deleteDocument');

  it('should return 200 if all good', async () => {
    const req = {
      params: { documentId: 'abc123' },
      currentContext: CURRENT_CONTEXT
    };

    const deleted = {
      documentId: 'abc123',
      activityId: '1',
      filename: 'testfile',
      mimeType: 'imgjpg',
      filesize: 1234567,
      createdByFullName: 'testuser'
    };

    deleteSpy.mockResolvedValue(deleted);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.deleteDocument(req as any, res as any, next);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.documentId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(deleted);
  });

  it('calls next if the document service fails to delete', async () => {
    const req = {
      params: { documentId: 'abc123' },
      currentContext: CURRENT_CONTEXT
    };

    deleteSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.deleteDocument(req as any, res as any, next);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.documentId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listDocuments', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(documentService, 'listDocuments');

  it('should return 200 if all good', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    const documentList = [
      {
        documentId: 'abc123',
        activityId: '1',
        filename: 'testfile',
        mimeType: 'imgjpg',
        filesize: 1234567,
        createdByFullName: 'testuser'
      }
    ];

    listSpy.mockResolvedValue(documentList);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.listDocuments(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(documentList);
  });

  it('calls next if the document service fails to list documents', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    listSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.listDocuments(req as any, res as any, next);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
