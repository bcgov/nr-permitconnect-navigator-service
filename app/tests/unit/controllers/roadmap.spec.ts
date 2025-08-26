import { roadmapController } from '../../../src/controllers';
import { comsService, emailService, noteService } from '../../../src/services';
import type { Note } from '../../../src/types';

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

const CURRENT_CONTEXT = { authType: 'BEARER', bearerToken: 'sometoken', tokenPayload: null, userId: 'abc-123' };

describe('send', () => {
  const next = jest.fn();

  // Mock service calls
  const emailSpy = jest.spyOn(emailService, 'email');
  const getObjectSpy = jest.spyOn(comsService, 'getObject');
  const createNoteSpy = jest.spyOn(noteService, 'createNote');

  it('should return 201 if all good', async () => {
    const req = {
      body: {
        activityId: '123-123',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: CURRENT_CONTEXT
    };

    const noteCreate: Note = {
      activityId: '123-123',
      note: 'Some message text',
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should create a note on success', async () => {
    const req = {
      body: {
        activityId: '123-123',
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests'
        }
      },
      currentContext: CURRENT_CONTEXT
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const noteCreate: Note = {
      activityId: '123-123',
      note: 'Some message text',
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ...noteCreate, createdAt: expect.stringMatching(isoPattern) })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should get coms objects and attach', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'foo'
      },
      status: 200
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    getObjectSpy.mockResolvedValue(getObjectResponse);
    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should not call COMS without a bearer token', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: { ...CURRENT_CONTEXT, bearerToken: null },
      headers: {}
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    emailSpy.mockResolvedValue(emailResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(0);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should append attachments to note', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('bar').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const emailResponse = {
      data: 'foo',
      status: 201
    };

    const getObjectResponse1 = {
      data: 'foo',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'foo'
      },
      status: 200
    };

    const getObjectResponse2 = {
      data: 'bar',
      headers: {
        'content-type': 'filetype',
        'x-amz-meta-name': 'bar'
      },
      status: 200
    };

    const note1 = `${getObjectResponse1.headers['x-amz-meta-name']}\n`;
    const note2 = `${getObjectResponse2.headers['x-amz-meta-name']}\n`;

    const noteCreate: Note = {
      activityId: '123-123',
      note: `Some message text\n\nAttachments:\n${note1}${note2}`,
      noteType: 'Roadmap',
      title: 'Sent roadmap',
      bringForwardDate: null,
      bringForwardState: null,
      createdAt: new Date().toISOString(),
      createdBy: 'abc-123',
      isDeleted: false
    };

    const isoPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

    createNoteSpy.mockResolvedValue(noteCreate);
    emailSpy.mockResolvedValue(emailResponse);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse1);
    getObjectSpy.mockResolvedValueOnce(getObjectResponse2);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(1);
    expect(emailSpy).toHaveBeenCalledWith(req.body.emailData);
    expect(createNoteSpy).toHaveBeenCalledTimes(1);
    expect(createNoteSpy).toHaveBeenCalledWith(
      expect.objectContaining({ ...noteCreate, createdAt: expect.stringMatching(isoPattern) })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(emailResponse.data);
  });

  it('should call next if COMS fails', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    getObjectSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should call next if a filename is not found', async () => {
    const req = {
      body: {
        activityId: '123-123',
        selectedFileIds: ['123', '456'],
        emailData: {
          body: 'Some message text',
          bodyType: 'text',
          from: 'test@gov.bc.ca',
          to: 'hello@gov.bc.ca',
          subject: 'Unit tests',
          attachments: [
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'foo'
            },
            {
              content: Buffer.from('foo').toString('base64'),
              contentType: 'filetype',
              encoding: 'base64',
              filename: 'bar'
            }
          ]
        }
      },
      currentContext: CURRENT_CONTEXT,
      headers: {}
    };

    const getObjectResponse = {
      data: 'foo',
      headers: {
        'content-type': 'filetype'
      },
      status: 200
    };

    getObjectSpy.mockResolvedValue(getObjectResponse);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await roadmapController.send(req as any, res as any, next);

    expect(getObjectSpy).toHaveBeenCalledTimes(2);
    expect(getObjectSpy).toHaveBeenNthCalledWith(1, req.currentContext.bearerToken, req.body.selectedFileIds[0]);
    expect(getObjectSpy).toHaveBeenNthCalledWith(2, req.currentContext.bearerToken, req.body.selectedFileIds[1]);
    expect(emailSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
