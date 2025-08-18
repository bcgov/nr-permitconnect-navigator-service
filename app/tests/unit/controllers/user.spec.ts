import { searchUsersController } from '../../../src/controllers/user';
import * as userService from '../../../src/services/user';

import type { Response } from 'express';

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

const TEST_USER_LIST = [
  {
    bceidBusinessName: null,
    userId: '5e3f0c19-8664-4a43-ac9e-210da336e923',
    idp: 'IDIR',
    sub: 'cd90c6bf44074872a7116f4dd4f3a45b@idir',
    email: 'first.last@gov.bc.ca',
    firstName: 'First',
    fullName: 'Last, First',
    lastName: 'Last',
    active: true,
    createdAt: null,
    createdBy: null,
    updatedAt: null,
    updatedBy: null
  }
];

describe('searchUsersController', () => {
  const next = jest.fn();

  // Mock service calls
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should return 200 if all good', async () => {
    const req = {
      query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
      currentContext: CURRENT_CONTEXT
    };

    searchUsersSpy.mockResolvedValue(TEST_USER_LIST);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await searchUsersController(req as any, res as unknown as Response);

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_USER_LIST);
  });

  it('adds dashes to user IDs', async () => {
    const req = {
      query: { userId: '5e3f0c1986644a43ac9e210da336e923,8b9dedd279d442c6b82f52844a8e2757' },
      currentContext: CURRENT_CONTEXT
    };

    searchUsersSpy.mockResolvedValue(TEST_USER_LIST);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await searchUsersController(req as any, res as unknown as Response);

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
    await searchUsersController(req as any, res as unknown as Response);

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith({
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
