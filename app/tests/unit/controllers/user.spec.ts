import { userController } from '../../../src/controllers';
import { userService } from '../../../src/services';

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

describe('searchUsers', () => {
  const next = jest.fn();

  // Mock service calls
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should return 200 if all good', async () => {
    const req = {
      query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
      currentContext: CURRENT_CONTEXT
    };

    const users = [
      {
        bceidBusinessName: null,
        userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
        idp: 'IDIR',
        sub: 'cd90c6bf44074872a7116f4dd4f3a45b@idir',
        email: 'first.last@gov.bc.ca',
        firstName: 'First',
        fullName: 'Last, First',
        lastName: 'Last',
        active: true
      }
    ];

    searchUsersSpy.mockResolvedValue(users);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await userController.searchUsers(req as any, res as any, next);

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(users);
  });

  it('adds dashes to user IDs', async () => {
    const req = {
      query: { userId: '5e3f0c1986644a43ac9e210da336e923,8b9dedd279d442c6b82f52844a8e2757' },
      currentContext: CURRENT_CONTEXT
    };

    const users = [
      {
        bceidBusinessName: null,
        userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
        idp: 'IDIR',
        sub: 'cd90c6bf44074872a7116f4dd4f3a45b@idir',
        email: 'first.last@gov.bc.ca',
        firstName: 'First',
        fullName: 'Last, First',
        lastName: 'Last',
        active: true
      }
    ];

    searchUsersSpy.mockResolvedValue(users);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await userController.searchUsers(req as any, res as any, next);

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923', '8b9dedd2-79d4-42c6-b82f-52844a8e2757']
    });
  });

  it('calls next if the user service fails to list users', async () => {
    const req = {
      query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
      currentContext: CURRENT_CONTEXT
    };

    searchUsersSpy.mockImplementationOnce(() => {
      throw new Error();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await userController.searchUsers(req as any, res as any, next);

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
