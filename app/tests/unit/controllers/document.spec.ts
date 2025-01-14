import { documentController } from '../../../src/controllers/index.ts';
import { documentService } from '../../../src/services/index.ts';

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

const CURRENT_CONTEXT = { authType: 'BEARER', tokenPayload: null, userId: 'abc-123' };

const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('createDocument', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(documentService, 'createDocument');

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

    createSpy.mockResolvedValue(created);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.createDocument(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.length,
      { createdAt: expect.stringMatching(isoPattern), createdBy: 'abc-123' }
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('calls next if the document service fails to create', async () => {
    const req = {
      body: { documentId: 'abc123', activityId: '1', filename: 'testfile', mimeType: 'imgjpg', length: 1234567 },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await documentController.createDocument(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith(
      req.body.documentId,
      req.body.activityId,
      req.body.filename,
      req.body.mimeType,
      req.body.length,
      { createdAt: expect.stringMatching(isoPattern), createdBy: expect.any(String) }
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
