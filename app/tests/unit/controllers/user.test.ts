import { TEST_CURRENT_CONTEXT, TEST_IDIR_USER_1 } from '../data/index.ts';
import { searchUsersController } from '../../../src/controllers/user.ts';
import * as userService from '../../../src/services/user.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { User, UserSearchParameters } from '../../../src/types/index.ts';

vi.mock('config');

const mockResponse = () => {
  const res: { locals: Record<string, unknown>; status?: Mock; json?: Mock; end?: Mock } = {
    locals: {}
  };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
  vi.clearAllMocks();
});

describe('searchUsersController', () => {
  it('should call service with extracted params and respond with 200', async () => {
    const mockUsers: User[] = [TEST_IDIR_USER_1];
    vi.spyOn(userService, 'searchUsersService').mockResolvedValueOnce(mockUsers);

    const searchParams: UserSearchParameters = {
      userId: ['user-1'],
      idp: ['azureidir'],
      sub: 'sub-123',
      email: 'test@example.com',
      firstName: 'John',
      fullName: 'John Doe',
      lastName: 'Doe',
      active: true
    };

    const req = { body: searchParams } as unknown as Request<never, never, UserSearchParameters, never>;

    await searchUsersController(req, res as unknown as Response);

    expect(userService.searchUsersService).toHaveBeenCalledTimes(1);
    expect(userService.searchUsersService).toHaveBeenCalledWith(searchParams);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should call service with partial params (isTruthy coercion)', async () => {
    const mockUsers: User[] = [];
    vi.spyOn(userService, 'searchUsersService').mockResolvedValueOnce(mockUsers);

    const req = { body: { active: undefined, firstName: 'Jane' } } as unknown as Request<
      never,
      never,
      UserSearchParameters,
      never
    >;

    await searchUsersController(req, res as unknown as Response);

    expect(userService.searchUsersService).toHaveBeenCalledTimes(1);
    expect(userService.searchUsersService).toHaveBeenCalledWith({
      userId: undefined,
      idp: undefined,
      sub: undefined,
      email: undefined,
      firstName: 'Jane',
      fullName: undefined,
      lastName: undefined,
      active: undefined,
      group: undefined,
      initiative: undefined,
      includeUserGroups: undefined
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUsers);
  });
});
