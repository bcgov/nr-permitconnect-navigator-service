import express from 'express';
import request from 'supertest';

import { requireSomeGroup } from '../../../src/middleware/requireSomeGroup.ts';
import * as comsService from '../../../src/services/coms.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { GroupName, IdentityProviderKind, Initiative } from '../../../src/utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp(currentContext: unknown) {
  const app = express();
  app.use((_req, res, next) => {
    res.locals.currentContext = currentContext;
    next();
  });
  app.get('/ok', requireSomeGroup, (_req, res) => res.status(200).json({ ok: true }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });
  return app;
}

const getSubjectGroupsSpy = vi.spyOn(yarsService, 'getSubjectGroups');
const getGroupsSpy = vi.spyOn(yarsService, 'getGroups');
const assignGroupSpy = vi.spyOn(yarsService, 'assignGroup');
const assignPermissionsSpy = vi.spyOn(comsService, 'assignPermissions');

afterEach(() => {
  vi.resetAllMocks();
});

describe('requireSomeGroup middleware', () => {
  it('responds with 403 when token sub is missing', async () => {
    const res = await request(buildApp({ tokenPayload: {} })).get('/ok');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Unable to obtain token sub');
  });

  it('passes through for AZUREIDIR users that already have groups', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([{ groupId: 1 }] as never);

    const res = await request(
      buildApp({ tokenPayload: { sub: 'idir-sub', identity_provider: IdentityProviderKind.AZUREIDIR } })
    ).get('/ok');

    expect(res.status).toBe(200);
    expect(assignGroupSpy).not.toHaveBeenCalled();
  });

  it('returns 403 for AZUREIDIR users with no groups', async () => {
    getSubjectGroupsSpy.mockResolvedValueOnce([] as never);

    const res = await request(
      buildApp({ tokenPayload: { sub: 'idir-sub', identity_provider: IdentityProviderKind.AZUREIDIR } })
    ).get('/ok');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('User lacks permission to complete this action');
  });

  it('assigns missing proponent groups for non-IDIR users and assigns COMS permissions', async () => {
    // First read: user has no groups; second read after assignment: has proponent groups
    getSubjectGroupsSpy
      .mockResolvedValueOnce([] as never)
      .mockResolvedValueOnce([{ groupId: 10, name: GroupName.PROPONENT, initiativeCode: Initiative.HOUSING }] as never);
    getGroupsSpy.mockResolvedValue([{ groupId: 10, name: GroupName.PROPONENT }] as never);
    assignGroupSpy.mockResolvedValue(undefined as unknown as { sub: string; roleId: number });
    assignPermissionsSpy.mockResolvedValue(undefined);

    const res = await request(
      buildApp({ tokenPayload: { sub: 'bceid-sub', identity_provider: IdentityProviderKind.BCEID } })
    ).get('/ok');

    expect(res.status).toBe(200);
    // 4 missing initiatives: ELECTRIFICATION, GENERAL, HOUSING, PCNS
    expect(getGroupsSpy).toHaveBeenCalledTimes(4);
    expect(assignGroupSpy).toHaveBeenCalledTimes(4);
    expect(assignPermissionsSpy).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'bceid-sub');
  });

  it('skips assignment for non-IDIR users that already have all required initiative groups', async () => {
    getSubjectGroupsSpy.mockResolvedValue([
      { groupId: 1, initiativeCode: Initiative.ELECTRIFICATION },
      { groupId: 2, initiativeCode: Initiative.GENERAL },
      { groupId: 3, initiativeCode: Initiative.HOUSING },
      { groupId: 4, initiativeCode: Initiative.PCNS }
    ] as never);

    const res = await request(
      buildApp({ tokenPayload: { sub: 'bceid-sub', identity_provider: IdentityProviderKind.BCEID } })
    ).get('/ok');

    expect(res.status).toBe(200);
    expect(getGroupsSpy).not.toHaveBeenCalled();
    expect(assignGroupSpy).not.toHaveBeenCalled();
  });
});
