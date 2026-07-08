import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import {
  deleteSubjectGroupController,
  getGroupsController,
  listPermissionsController,
  listSubjectPermissionsController
} from '../../../src/controllers/yars.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { LocalContext } from '../../../src/types/index.ts';

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
  vi.clearAllMocks();
  res = mockResponse();
  res.locals.currentContext = TEST_CURRENT_CONTEXT;
});

const SUB = 'cd90c6bf44074872a7116f4dd4f3a45b@azureidir';

describe('getGroupsController', () => {
  const getGroupsSpy = vi.spyOn(yarsService, 'getGroupsService');

  it('calls the service with the initiative query then responds 200', async () => {
    const groups = [{ groupId: 1, name: GroupName.NAVIGATOR, initiativeCode: Initiative.HOUSING }];
    const req = { query: { initiative: Initiative.HOUSING } } as unknown as Request<
      never,
      never,
      never,
      { initiative: Initiative }
    >;

    getGroupsSpy.mockResolvedValue(groups as never);

    await getGroupsController(req, res as unknown as Response);

    expect(getGroupsSpy).toHaveBeenCalledTimes(1);
    expect(getGroupsSpy).toHaveBeenCalledWith(Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(groups);
  });
});

describe('listPermissionsController', () => {
  const listPermissionsSpy = vi.spyOn(yarsService, 'listPermissionsService');

  it('calls the service with the initiative and groupName queries then responds 200', async () => {
    const response = { groups: [{ groupId: 1, name: GroupName.NAVIGATOR }], permissions: [{ action: 'READ' }] };
    const req = {
      query: { initiative: Initiative.HOUSING, groupName: GroupName.NAVIGATOR }
    } as unknown as Request<never, never, never, { initiative: Initiative; groupName: GroupName }>;

    listPermissionsSpy.mockResolvedValue(response as never);

    await listPermissionsController(req, res as unknown as Response);

    expect(listPermissionsSpy).toHaveBeenCalledTimes(1);
    expect(listPermissionsSpy).toHaveBeenCalledWith(Initiative.HOUSING, GroupName.NAVIGATOR);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(response);
  });
});

describe('listSubjectPermissionsController', () => {
  const listSubjectPermissionsSpy = vi.spyOn(yarsService, 'listSubjectPermissionsService');

  it('calls the service with the current context then responds 200 with groups and permissions', async () => {
    const response = { groups: [{ groupId: 1 }, { groupId: 2 }], permissions: [{ action: 'READ' }] };
    const req = {} as unknown as Request;

    listSubjectPermissionsSpy.mockResolvedValue(response as never);

    await listSubjectPermissionsController(req, res as unknown as Response<unknown, LocalContext>);

    expect(listSubjectPermissionsSpy).toHaveBeenCalledTimes(1);
    expect(listSubjectPermissionsSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ groups: response.groups, permissions: response.permissions });
  });
});

describe('deleteSubjectGroupController', () => {
  const deleteSubjectGroupSpy = vi.spyOn(yarsService, 'deleteSubjectGroupService');

  it('calls the service with the current context, sub and groupId then responds 204', async () => {
    const body = { sub: SUB, groupId: 7 };
    const req = { body } as unknown as Request<never, never, { sub: string; groupId: number }>;

    deleteSubjectGroupSpy.mockResolvedValue(undefined as never);

    await deleteSubjectGroupController(req, res as unknown as Response<never, LocalContext>);

    expect(deleteSubjectGroupSpy).toHaveBeenCalledTimes(1);
    expect(deleteSubjectGroupSpy).toHaveBeenCalledWith(TEST_CURRENT_CONTEXT, body.sub, body.groupId);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledWith();
  });
});
