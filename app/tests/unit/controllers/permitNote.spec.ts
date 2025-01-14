import { permitNoteController } from '../../../src/controllers/index.ts';
import { permitNoteService } from '../../../src/services/index.ts';

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

describe('createPermitNote', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(permitNoteService, 'createPermitNote');

  it('should return 201 if all good', async () => {
    const now = new Date();
    const req = {
      body: {
        permitId: 'PERMIT123',
        note: 'This is a permit note.',
        isDeleted: false
      },
      currentContext: CURRENT_CONTEXT
    };

    const created = {
      permitNoteId: 'NOTE123',
      permitId: 'PERMIT123',
      note: 'This is a permit note.',
      isDeleted: false,
      createdAt: now.toISOString(),
      createdBy: 'abc-123'
    };

    createSpy.mockResolvedValue(created);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitNoteController.createPermitNote(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  it('calls next if the permitNote service fails to create', async () => {
    const req = {
      body: {
        permitId: 'PERMIT123',
        note: 'This is a permit note.',
        isDeleted: false
      },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await permitNoteController.createPermitNote(req as any, res as any, next);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
