import { TEST_CURRENT_CONTEXT, TEST_IDIR_USER_1, TEST_INITIATIVE_HOUSING } from '../data/index.ts';
import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { getUsersWithGroups, searchUsersController } from '../../../src/controllers/user.ts';
import * as initiativeService from '../../../src/services/initiative.ts';
import * as userService from '../../../src/services/user.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { Group, User, UserSearchParameters } from '../../../src/types/index.ts';

vi.mock('config');

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock; end?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);

  return res;
};

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.resetAllMocks();
});

const TEST_USER_LIST = [TEST_IDIR_USER_1];

describe('searchUsersController', () => {
  const searchUsersSpy = vi.spyOn(userService, 'searchUsers');

  it('should call services and respond with 200 and result', async () => {
    const req = {
      body: { userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923'] },
      currentContext: TEST_CURRENT_CONTEXT
    };

    searchUsersSpy.mockResolvedValue(TEST_USER_LIST);

    await searchUsersController(
      req as unknown as Request<never, never, UserSearchParameters, never>,
      res as unknown as Response
    );

    expect(searchUsersSpy).toHaveBeenCalledTimes(1);
    expect(searchUsersSpy).toHaveBeenCalledWith(prismaTxMock, {
      userId: ['5e3f0c19-8664-4a43-ac9e-210da336e923']
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(TEST_USER_LIST);
  });
});

describe('getUsersWithGroups', () => {
  const getSubjectGroupsSpy = vi.spyOn(yarsService, 'getSubjectGroups');
  const getInitiativeSpy = vi.spyOn(initiativeService, 'getInitiative');

  const housingGroup: Group = {
    groupId: 1,
    name: GroupName.NAVIGATOR,
    initiativeId: TEST_INITIATIVE_HOUSING.initiativeId,
    initiativeCode: Initiative.HOUSING
  };
  const electrificationGroup: Group = {
    groupId: 2,
    name: GroupName.PROPONENT,
    initiativeId: 'other-initiative-id',
    initiativeCode: Initiative.ELECTRIFICATION
  };

  it('returns users untouched when no group/includeUserGroups option set', async () => {
    const users: User[] = [TEST_IDIR_USER_1];

    const result = await getUsersWithGroups(prismaTxMock, users, {});

    expect(getSubjectGroupsSpy).not.toHaveBeenCalled();
    expect(result).toBe(users);
  });

  it('attaches groups when includeUserGroups is truthy', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([housingGroup, electrificationGroup]);

    const result = await getUsersWithGroups(prismaTxMock, [TEST_IDIR_USER_1], { includeUserGroups: true });

    expect(result[0].groups).toEqual([housingGroup, electrificationGroup]);
  });

  it('filters users by group name and strips groups when includeUserGroups is not requested', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([electrificationGroup]);

    const result = await getUsersWithGroups(prismaTxMock, [TEST_IDIR_USER_1], { group: [GroupName.NAVIGATOR] });

    expect(result).toHaveLength(0);
  });

  it('keeps matching users and removes groups attribute when not requested', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([housingGroup]);

    const result = await getUsersWithGroups(prismaTxMock, [TEST_IDIR_USER_1], { group: [GroupName.NAVIGATOR] });

    expect(result).toHaveLength(1);
    expect(result[0].groups).toBeUndefined();
  });

  it('filters groups by initiative when initiative option provided', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([housingGroup, electrificationGroup]);
    getInitiativeSpy.mockResolvedValueOnce(TEST_INITIATIVE_HOUSING);

    const result = await getUsersWithGroups(prismaTxMock, [TEST_IDIR_USER_1], {
      includeUserGroups: true,
      initiative: [Initiative.HOUSING]
    });

    expect(getInitiativeSpy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING);
    expect(result[0].groups).toEqual([housingGroup]);
  });
});
