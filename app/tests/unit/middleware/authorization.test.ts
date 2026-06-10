import express from 'express';
import request from 'supertest';

import { hasAccess, hasAuthorization } from '../../../src/middleware/authorization.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as contactService from '../../../src/services/contact.ts';
import * as userService from '../../../src/services/user.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Group } from '../../../src/types/index.ts';
import type Problem from '../../../src/utils/problem.ts';

const SUB = 'cd90c6bf44074872a7116f4dd4f3a45b@azureidir';
const USER_ID = 'user-123';
const CONTACT_ID = 'contact-1';

function buildAppForHasAuthorization(currentContext: unknown) {
  const app = express();
  app.use((req, _res, next) => {
    (req as Request).currentContext = currentContext as Request['currentContext'];
    next();
  });
  app.get('/test', hasAuthorization('document', 'read'), (req: Request, res: Response) => {
    res.status(200).json({
      attributes: req.currentAuthorization?.attributes,
      groupCount: req.currentAuthorization?.groups.length
    });
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });
  return app;
}

function buildAppForHasAccess(currentAuthorization: unknown, currentContext: unknown, route = '/d/:documentId') {
  const app = express();
  app.use((req, _res, next) => {
    (req as Request).currentContext = currentContext as Request['currentContext'];
    (req as Request).currentAuthorization = currentAuthorization as Request['currentAuthorization'];
    next();
  });
  app.get(route, hasAccess(route.includes(':documentId') ? 'documentId' : 'activityId'), (_req, res) => {
    res.status(200).json({ ok: true });
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });
  return app;
}

const getCurrentUserIdSpy = vi.spyOn(userService, 'getCurrentUserId');
const getSubjectGroupsSpy = vi.spyOn(yarsService, 'getSubjectGroups');
const getGroupPolicyDetailsSpy = vi.spyOn(yarsService, 'getGroupPolicyDetails');
const getPCNSGroupPolicyDetailsSpy = vi.spyOn(yarsService, 'getPCNSGroupPolicyDetails');
const getPolicyAttributesSpy = vi.spyOn(yarsService, 'getPolicyAttributes');
const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
const listActivityContactsSpy = vi.spyOn(activityContactService, 'listActivityContacts');

afterEach(() => {
  vi.resetAllMocks();
});

describe('hasAuthorization middleware', () => {
  it('returns 403 when no currentContext present', async () => {
    const res = await request(buildAppForHasAuthorization(undefined)).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('No current user');
  });

  it('returns 403 when getCurrentUserId returns null', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(null as unknown as string);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid user');
  });

  it('returns 403 when token sub is missing', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);

    const res = await request(buildAppForHasAuthorization({ tokenPayload: {}, initiative: Initiative.HOUSING })).get(
      '/test'
    );

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('No subject');
  });

  it('returns 403 when user has no groups', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);
    getSubjectGroupsSpy.mockResolvedValueOnce([] as Group[]);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid group(s)');
  });

  it('grants scope:all when user is a DEVELOPER', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);
    getSubjectGroupsSpy.mockResolvedValueOnce([{ groupId: 1, name: GroupName.DEVELOPER }] as Group[]);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toContain('scope:all');
    expect(getGroupPolicyDetailsSpy).not.toHaveBeenCalled();
  });

  it('returns 403 when no policies are found for non-developer groups', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);
    getSubjectGroupsSpy.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as Group[]);
    getGroupPolicyDetailsSpy.mockResolvedValueOnce([] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid policies');
  });

  it('uses PCNS policy lookup when initiative is PCNS and aggregates attributes', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);
    getSubjectGroupsSpy.mockResolvedValueOnce([
      { groupId: 1, name: GroupName.NAVIGATOR },
      { groupId: 2, name: GroupName.NAVIGATOR } // duplicate name -> deduped
    ] as Group[]);
    getPCNSGroupPolicyDetailsSpy.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    getPolicyAttributesSpy.mockResolvedValueOnce([{ groupId: [], attributeName: 'scope:all' }] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.PCNS })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(getPCNSGroupPolicyDetailsSpy).toHaveBeenCalledTimes(1);
    expect(getGroupPolicyDetailsSpy).not.toHaveBeenCalled();
    expect(res.body.attributes).toEqual(['scope:all']);
  });

  it('uses standard group policy lookup for non-PCNS initiatives and filters by matching groupId', async () => {
    getCurrentUserIdSpy.mockResolvedValueOnce(USER_ID);
    getSubjectGroupsSpy.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as Group[]);
    getGroupPolicyDetailsSpy.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    getPolicyAttributesSpy.mockResolvedValueOnce([
      { groupId: [1], attributeName: 'scope:self' },
      { groupId: [99], attributeName: 'scope:none' }
    ] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toEqual(['scope:self']);
  });
});

describe('hasAccess middleware', () => {
  it('passes through without lookups when scope:self is not present', async () => {
    const res = await request(buildAppForHasAccess({ attributes: ['scope:all'], groups: [] }, { userId: USER_ID })).get(
      '/d/some-id'
    );

    expect(res.status).toBe(200);
    expect(searchContactsSpy).not.toHaveBeenCalled();
  });

  it('allows the request when current user contact is part of the activity contacts', async () => {
    searchContactsSpy.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    listActivityContactsSpy.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(200);
    expect(searchContactsSpy).toHaveBeenCalledWith(expect.anything(), { userId: [USER_ID] });
    expect(listActivityContactsSpy).toHaveBeenCalled();
  });

  it('returns 403 when user contact is not in the activity contact list', async () => {
    searchContactsSpy.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    listActivityContactsSpy.mockResolvedValueOnce([{ contactId: 'someone-else' }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-2');

    expect(res.status).toBe(403);
  });

  it('uses the param value directly when param is activityId', async () => {
    searchContactsSpy.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    listActivityContactsSpy.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID }, '/a/:activityId')
    ).get('/a/act-99');

    expect(res.status).toBe(200);
    expect(listActivityContactsSpy).toHaveBeenCalledWith(expect.anything(), 'act-99');
  });
});
