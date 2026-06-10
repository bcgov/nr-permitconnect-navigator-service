import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import {
  deleteSubjectGroupController,
  getGroupsController,
  getPermissionsController
} from '../../../src/controllers/yars.ts';
import * as comsService from '../../../src/services/coms.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { Initiative } from '../../../src/utils/enums/application.ts';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock; end?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

const SUB = 'cd90c6bf44074872a7116f4dd4f3a45b@azureidir';
const ctxWithSub = { ...TEST_CURRENT_CONTEXT, tokenPayload: { sub: SUB } };

let res = mockResponse();
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('getGroupsController', () => {
  const spy = vi.spyOn(yarsService, 'getGroups');

  it('returns 200 with groups for given initiative', async () => {
    const groups = [{ groupId: 1, name: 'NAVIGATOR', initiativeCode: Initiative.HOUSING }] as never;
    spy.mockResolvedValueOnce(groups);

    await getGroupsController(
      { query: { initiative: Initiative.HOUSING } } as unknown as Request<
        never,
        never,
        never,
        { initiative: Initiative }
      >,
      res as unknown as Response
    );

    expect(spy).toHaveBeenCalledWith(prismaTxMock, Initiative.HOUSING);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(groups);
  });
});

describe('getPermissionsController', () => {
  const getSubjectGroupsSpy = vi.spyOn(yarsService, 'getSubjectGroups');
  const getGroupPermissionsSpy = vi.spyOn(yarsService, 'getGroupPermissions');
  const assignPermissionsSpy = vi.spyOn(comsService, 'assignPermissions');

  it('returns groups and flattened permissions', async () => {
    const groups = [{ groupId: 1 }, { groupId: 2 }] as never;
    getSubjectGroupsSpy.mockResolvedValueOnce(groups);
    getGroupPermissionsSpy
      .mockResolvedValueOnce([{ action: 'READ' }] as never)
      .mockResolvedValueOnce([{ action: 'CREATE' }] as never);
    assignPermissionsSpy.mockResolvedValueOnce(undefined);

    await getPermissionsController({ currentContext: ctxWithSub } as unknown as Request, res as unknown as Response);

    expect(getSubjectGroupsSpy).toHaveBeenCalledWith(prismaTxMock, SUB);
    expect(getGroupPermissionsSpy).toHaveBeenCalledTimes(2);
    expect(assignPermissionsSpy).toHaveBeenCalledWith(prismaTxMock, ctxWithSub, SUB);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      groups,
      permissions: [{ action: 'READ' }, { action: 'CREATE' }]
    });
  });

  it('throws 500 when token sub missing', async () => {
    await expect(
      getPermissionsController(
        { currentContext: { ...TEST_CURRENT_CONTEXT, tokenPayload: undefined } } as unknown as Request,
        res as unknown as Response
      )
    ).rejects.toMatchObject({ status: 500 });
  });
});

describe('deleteSubjectGroupController', () => {
  const getSubjectGroupsSpy = vi.spyOn(yarsService, 'getSubjectGroups');
  const removeGroupSpy = vi.spyOn(yarsService, 'removeGroup');
  const subjectHasGroupNameSpy = vi.spyOn(yarsService, 'subjectHasGroupName');
  const getCorrespondingGlobalGroupSpy = vi.spyOn(yarsService, 'getCorrespondingGlobalGroup');
  const assignPermissionsSpy = vi.spyOn(comsService, 'assignPermissions');

  const body = { sub: SUB, groupId: 7 };

  it('removes group + corresponding global group when no other initiative has the same group name', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([
      { groupId: 7, name: 'NAVIGATOR', initiativeCode: Initiative.HOUSING }
    ] as never);
    removeGroupSpy.mockResolvedValueOnce(undefined as never);
    subjectHasGroupNameSpy.mockResolvedValueOnce(false);
    getCorrespondingGlobalGroupSpy.mockResolvedValueOnce({ groupId: 99 } as never);
    removeGroupSpy.mockResolvedValueOnce(undefined as never);
    assignPermissionsSpy.mockResolvedValueOnce(undefined);

    await deleteSubjectGroupController(
      { body, currentContext: ctxWithSub } as unknown as Request<never, never, typeof body>,
      res as unknown as Response
    );

    expect(removeGroupSpy).toHaveBeenNthCalledWith(1, prismaTxMock, SUB, 7);
    expect(getCorrespondingGlobalGroupSpy).toHaveBeenCalledWith(prismaTxMock, 7);
    expect(removeGroupSpy).toHaveBeenNthCalledWith(2, prismaTxMock, SUB, 99);
    expect(assignPermissionsSpy).toHaveBeenCalledWith(prismaTxMock, ctxWithSub, SUB);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalledTimes(1);
  });

  it('does NOT remove the global group when subject still has the same group name in another initiative', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([
      { groupId: 7, name: 'NAVIGATOR', initiativeCode: Initiative.HOUSING }
    ] as never);
    removeGroupSpy.mockResolvedValue(undefined as never);
    subjectHasGroupNameSpy.mockResolvedValueOnce(true);
    assignPermissionsSpy.mockResolvedValueOnce(undefined);

    await deleteSubjectGroupController(
      { body, currentContext: ctxWithSub } as unknown as Request<never, never, typeof body>,
      res as unknown as Response
    );

    expect(removeGroupSpy).toHaveBeenCalledTimes(1);
    expect(getCorrespondingGlobalGroupSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('rejects with 422 when trying to delete a PCNS (global) group directly', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([
      { groupId: 7, name: 'NAVIGATOR', initiativeCode: Initiative.PCNS }
    ] as never);

    await expect(
      deleteSubjectGroupController(
        { body, currentContext: ctxWithSub } as unknown as Request<never, never, typeof body>,
        res as unknown as Response
      )
    ).rejects.toMatchObject({ status: 422 });

    expect(removeGroupSpy).not.toHaveBeenCalled();
  });
});
