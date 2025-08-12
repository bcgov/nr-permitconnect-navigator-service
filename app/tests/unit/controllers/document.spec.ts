import {
  createDocumentController,
  deleteDocumentController,
  listDocumentsController
} from '../../../src/controllers/document';
import * as documentService from '../../../src/services/document';
import { isoPattern } from '../../../src/utils/regexp';

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

const TEST_DOCUMENT = {
  documentId: 'abc123',
  activityId: '1',
  filename: 'testfile',
  mimeType: 'imgjpg',
  filesize: 1234567,
  createdByFullName: 'testuser',
  createdAt: null,
  createdBy: null,
  updatedBy: null,
  updatedAt: null
};

describe('createDocumentController', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(documentService, 'createDocument');

  it('should return 201 if all good', async () => {
    const req = {
      body: { documentId: 'abc123', activityId: '1', filename: 'testfile', mimeType: 'imgjpg', length: 1234567 },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockResolvedValue(TEST_DOCUMENT);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createDocumentController(req as any, res as any);

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
    expect(res.json).toHaveBeenCalledWith(TEST_DOCUMENT);
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
    await createDocumentController(req as any, res as any);

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

describe('deleteDocumentController', () => {
  const next = jest.fn();

  // Mock service calls
  const deleteSpy = jest.spyOn(documentService, 'deleteDocument');

  it('should return 200 if all good', async () => {
    const req = {
      params: { documentId: 'abc123' },
      currentContext: CURRENT_CONTEXT
    };

    deleteSpy.mockResolvedValue(TEST_DOCUMENT);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await deleteDocumentController(req as any, res as any);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.documentId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_DOCUMENT);
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
    await deleteDocumentController(req as any, res as any);

    expect(deleteSpy).toHaveBeenCalledTimes(1);
    expect(deleteSpy).toHaveBeenCalledWith(req.params.documentId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('listDocumentsController', () => {
  const next = jest.fn();

  // Mock service calls
  const listSpy = jest.spyOn(documentService, 'listDocuments');

  it('should return 200 if all good', async () => {
    const req = {
      params: { activityId: 'ACT_ID' },
      currentContext: CURRENT_CONTEXT
    };

    listSpy.mockResolvedValue([TEST_DOCUMENT]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await listDocumentsController(req as any, res as any);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([TEST_DOCUMENT]);
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
    await listDocumentsController(req as any, res as any);

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
