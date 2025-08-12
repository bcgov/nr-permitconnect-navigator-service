import { createPermitNoteController } from '../../../src/controllers/permitNote';
import * as permitNoteService from '../../../src/services/permitNote';
import { isoPattern } from '../../../src/utils/regexp';

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

const TEST_PERMIT_NOTE = {
  permitNoteId: 'NOTE123',
  permitId: 'PERMIT123',
  note: 'This is a permit note.',
  isDeleted: false,
  createdAt: new Date(),
  createdBy: 'abc-123',
  updatedAt: null,
  updatedBy: null
};

describe('createPermitNote', () => {
  const next = jest.fn();

  // Mock service calls
  const createSpy = jest.spyOn(permitNoteService, 'createPermitNote');

  it('should return 201 if all good', async () => {
    const req = {
      body: {
        permitId: 'PERMIT123',
        note: 'This is a permit note.',
        isDeleted: false
      },
      currentContext: CURRENT_CONTEXT
    };

    createSpy.mockResolvedValue(TEST_PERMIT_NOTE);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await createPermitNoteController(req as any, res as any);

    expect(createSpy).toHaveBeenCalledTimes(1);
    expect(createSpy).toHaveBeenCalledWith({
      ...req.body,
      createdAt: expect.stringMatching(isoPattern),
      createdBy: 'abc-123'
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(TEST_PERMIT_NOTE);
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
    await createPermitNoteController(req as any, res as any);

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
