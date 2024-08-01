import { activityController } from '../../../src/controllers';
import { activityService } from '../../../src/services';

// Mock config library - @see {@link https://stackoverflow.com/a/64819698}
jest.mock('config');

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);

  return res;
};

let res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock };
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  /*
   * Must use clearAllMocks when using the mocked config
   * resetAllMocks seems to cause strange issues such as
   * functions not calling as expected
   */
  jest.clearAllMocks();
});

const CURRENT_USER = { authType: 'BEARER', tokenPayload: null };

const ACTIVITY = {
  activityId: '12345678',
  initiativeId: '59cd9e86-7cce-4791-b071-69002c731315',
  isDeleted: false
};

const DELETED_ACTIVITY = {
  activityId: '87654321',
  initiativeId: '59cd9e86-7cce-4791-b071-69002c731315',
  isDeleted: true
};

describe('validateActivityId', () => {
  const next = jest.fn();

  // Mock service calls
  const activityServiceSpy = jest.spyOn(activityService, 'getActivity');

  it('shoulld return status 200 and valid true if activityId exists and isDeleted is false', async () => {
    const req = {
      params: { activityId: '12345678' },
      currentUser: CURRENT_USER
    };

    activityServiceSpy.mockResolvedValue(ACTIVITY);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(1);
    expect(activityServiceSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ valid: true });
  });

  it('shoulld return status 200 and valid false if activityId exists but isDeleted is true', async () => {
    const req = {
      params: { activityId: '87654321' },
      currentUser: CURRENT_USER
    };

    activityServiceSpy.mockResolvedValue(DELETED_ACTIVITY);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(1);
    expect(activityServiceSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ valid: false });
  });

  it('shoulld return status 200 and valid false if activityId does not exist', async () => {
    const req = {
      params: { activityId: 'FFFFFFFF' },
      currentUser: CURRENT_USER
    };

    activityServiceSpy.mockResolvedValue(null);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(1);
    expect(activityServiceSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ valid: false });
  });

  it('Should return 400 and error message if activityId does not have correct length', async () => {
    const req = {
      params: { activityId: '12345' },
      currentUser: CURRENT_USER
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid activity Id format' });
  });

  it('Should return 400 and error message if activityId is not hexidecimal value', async () => {
    const req = {
      params: { activityId: 'GGGGGGGG' },
      currentUser: CURRENT_USER
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid activity Id format' });
  });

  it('Should call next with error if getActivity fails', async () => {
    const req = {
      params: { activityId: '12345678' },
      currentUser: CURRENT_USER
    };

    const error = new Error();

    activityServiceSpy.mockRejectedValue(error);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await activityController.validateActivityId(req as any, res as any, next);

    expect(activityServiceSpy).toHaveBeenCalledTimes(1);
    expect(activityServiceSpy).toHaveBeenCalledWith(req.params.activityId);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});
