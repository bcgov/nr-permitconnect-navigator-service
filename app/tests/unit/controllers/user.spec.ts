import { TEST_CURRENT_CONTEXT, TEST_IDIR_USER_1 } from '../data';
import { searchUsersController } from '../../../src/controllers/user';
import * as userService from '../../../src/services/user';

import type { Request, Response } from 'express';
import type { UserSearchParameters } from '../../../src/types';
import { prismaTxMock } from '../../__mocks__/prismaMock';

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

const TEST_USER_LIST = [TEST_IDIR_USER_1];

describe('searchUsersController', () => {
  const searchUsersSpy = jest.spyOn(userService, 'searchUsers');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      query: { userId: '5e3f0c19-8664-4a43-ac9e-210da336e923' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchUsersSpy.mockResolvedValue(TEST_USER_LIST);

    await searchUsersController(
      req as unknown as Request<never, never, never, UserSearchParameters>,
      res as unknown as Response
    );

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_USER_LIST);
  });

  it('adds dashes to user IDs', async () => {
    const req = {
      query: { userId: '5e3f0c1986644a43ac9e210da336e923,8b9dedd279d442c6b82f52844a8e2757' },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchUsersSpy.mockResolvedValue(TEST_USER_LIST);

    await searchUsersController(
      req as unknown as Request<never, never, never, UserSearchParameters>,
      res as unknown as Response
    );

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923', '8b9dedd2-79d4-42c6-b82f-52844a8e2757']
    });
  });
});
