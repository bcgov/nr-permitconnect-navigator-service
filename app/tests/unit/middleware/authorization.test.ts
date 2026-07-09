import express from 'express';
import request from 'supertest';

import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import { hasAccess, hasAuthorization } from '../../../src/middleware/authorization.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

const SUB = 'cd90c6bf44074872a7116f4dd4f3a45b@azureidir';
const USER_ID = 'user-123';
const CONTACT_ID = 'contact-1';

function buildAppForHasAuthorization(currentContext: unknown) {
  const app = express();
  app.use((_req, res, next) => {
    res.locals.currentContext = currentContext;
    next();
  });
  app.get('/test', hasAuthorization('document', 'read'), (req: Request, res: Response) => {
    res.status(200).json({
      attributes: res.locals.currentAuthorization?.attributes,
      groupCount: res.locals.currentAuthorization?.groups.length
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
  app.use((_req, res, next) => {
    res.locals.currentContext = currentContext;
    res.locals.currentAuthorization = currentAuthorization;
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

afterEach(() => {
  vi.clearAllMocks();
});

describe('hasAuthorization middleware', () => {
  it('returns 403 when no currentContext present', async () => {
    const res = await request(buildAppForHasAuthorization(undefined)).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('No current user');
  });

  it('returns 403 when getCurrentUserId returns null', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(null as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid user');
  });

  it('returns 403 when token sub is missing', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);

    const res = await request(buildAppForHasAuthorization({ tokenPayload: {}, initiative: Initiative.HOUSING })).get(
      '/test'
    );

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('No subject');
  });

  it('returns 403 when user has no groups', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid group(s)');
  });

  it('grants scope:all when user is a DEVELOPER', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.DEVELOPER }] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toContain('scope:all');
    expect(mockRepos.groupRolePolicyVw.getGroupPolicyDetails).not.toHaveBeenCalled();
  });

  it('returns 403 when no policies are found for non-developer groups', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails.mockResolvedValueOnce([] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Invalid policies');
  });

  it('uses PCNS policy lookup when initiative is PCNS and aggregates attributes', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([
      { groupId: 1, name: GroupName.NAVIGATOR },
      { groupId: 2, name: GroupName.NAVIGATOR }
    ] as never);
    mockRepos.groupRolePolicyVw.getPCNSGroupPolicyDetails.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    mockRepos.policyAttribute.getPolicyAttributes.mockResolvedValueOnce([
      { groupId: [], attributeName: 'scope:all' }
    ] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.PCNS })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(mockRepos.groupRolePolicyVw.getPCNSGroupPolicyDetails).toHaveBeenCalledTimes(1);
    expect(mockRepos.groupRolePolicyVw.getGroupPolicyDetails).not.toHaveBeenCalled();
    expect(res.body.attributes).toEqual(['scope:all']);
  });

  it('uses standard group policy lookup for non-PCNS initiatives and filters by matching groupId', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    mockRepos.policyAttribute.getPolicyAttributes.mockResolvedValueOnce([
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
    expect(prismaTxMock.contact.findMany).not.toHaveBeenCalled();
  });

  it('allows the request when current user contact is part of the activity contacts', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-1' } as never);
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    prismaTxMock.activity_contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(200);
    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({ where: { userId: USER_ID } });
    expect(prismaTxMock.activity_contact.findMany).toHaveBeenCalledWith({
      where: { activityId: 'act-1' },
      include: { contact: true }
    });
  });

  it('returns 403 when user contact is not in the activity contact list', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-2' } as never);
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    prismaTxMock.activity_contact.findMany.mockResolvedValueOnce([{ contactId: 'someone-else' }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-2');

    expect(res.status).toBe(403);
  });

  it('uses the param value directly when param is activityId', async () => {
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    prismaTxMock.activity_contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID }, '/a/:activityId')
    ).get('/a/act-99');

    expect(res.status).toBe(200);
    expect(prismaTxMock.activity_contact.findMany).toHaveBeenCalledWith({
      where: { activityId: 'act-99' },
      include: { contact: true }
    });
  });

  it('returns 403 when user has no contacts', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-1' } as never);
    prismaTxMock.contact.findMany.mockResolvedValueOnce([] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(403);
    expect(prismaTxMock.contact.findMany).toHaveBeenCalledWith({ where: { userId: USER_ID } });
  });

  it('returns 403 when activity has no contacts', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-1' } as never);
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    prismaTxMock.activity_contact.findMany.mockResolvedValueOnce([] as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(403);
  });

  it('throws 403 when document lookup fails', async () => {
    prismaTxMock.document.findFirst.mockRejectedValueOnce(new Error('Database error') as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(403);
  });

  it('throws 403 when contact lookup fails', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-1' } as never);
    prismaTxMock.contact.findMany.mockRejectedValueOnce(new Error('Database error') as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(403);
  });

  it('throws 403 when activity_contact lookup fails', async () => {
    prismaTxMock.document.findFirst.mockResolvedValueOnce({ activityId: 'act-1' } as never);
    prismaTxMock.contact.findMany.mockResolvedValueOnce([{ contactId: CONTACT_ID }] as never);
    prismaTxMock.activity_contact.findMany.mockRejectedValueOnce(new Error('Database error') as never);

    const res = await request(
      buildAppForHasAccess({ attributes: ['scope:self'], groups: [] }, { userId: USER_ID })
    ).get('/d/doc-1');

    expect(res.status).toBe(403);
  });
});

describe('hasAuthorization middleware - Error Handling', () => {
  it('returns 403 when subjectGroup.getSubjectGroups throws', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockRejectedValueOnce(new Error('Group lookup failed') as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Group lookup failed');
  });

  it('returns 403 when getGroupPolicyDetails throws', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails.mockRejectedValueOnce(new Error('Policy lookup failed') as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Policy lookup failed');
  });

  it('returns 403 when getPCNSGroupPolicyDetails throws', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getPCNSGroupPolicyDetails.mockRejectedValueOnce(
      new Error('PCNS policy lookup failed') as never
    );

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.PCNS })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('PCNS policy lookup failed');
  });

  it('returns 403 when getPolicyAttributes throws', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    mockRepos.policyAttribute.getPolicyAttributes.mockRejectedValueOnce(new Error('Attribute lookup failed') as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('Attribute lookup failed');
  });
});

describe('hasAuthorization middleware - Complex Scenarios', () => {
  it('aggregates attributes from multiple groups with same name (PCNS)', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([
      { groupId: 1, name: GroupName.NAVIGATOR },
      { groupId: 2, name: GroupName.NAVIGATOR },
      { groupId: 3, name: GroupName.NAVIGATOR }
    ] as never);
    mockRepos.groupRolePolicyVw.getPCNSGroupPolicyDetails.mockResolvedValueOnce([
      { policyId: 'p-1' },
      { policyId: 'p-2' }
    ] as never);
    mockRepos.policyAttribute.getPolicyAttributes
      .mockResolvedValueOnce([{ groupId: [], attributeName: 'scope:all' }] as never)
      .mockResolvedValueOnce([{ groupId: [], attributeName: 'manage:users' }] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.PCNS })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toContain('scope:all');
    expect(res.body.attributes).toContain('manage:users');
  });

  it('correctly filters attributes by matching groupId for non-PCNS with multiple groups', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([
      { groupId: 1, name: GroupName.NAVIGATOR },
      { groupId: 2, name: GroupName.NAVIGATOR }
    ] as never);
    // Mock getGroupPolicyDetails for both groupIds
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails
      .mockResolvedValueOnce([{ policyId: 'p-1' }] as never)
      .mockResolvedValueOnce([{ policyId: 'p-2' }] as never);
    mockRepos.policyAttribute.getPolicyAttributes
      .mockResolvedValueOnce([{ groupId: [1], attributeName: 'scope:self' }] as never)
      .mockResolvedValueOnce([
        { groupId: [2], attributeName: 'scope:all' },
        { groupId: [99], attributeName: 'scope:none' }
      ] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toContain('scope:self');
    expect(res.body.attributes).toContain('scope:all');
    expect(res.body.attributes).not.toContain('scope:none');
  });

  it('includes global attributes and group-specific attributes', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.NAVIGATOR }] as never);
    mockRepos.groupRolePolicyVw.getGroupPolicyDetails.mockResolvedValueOnce([{ policyId: 'p-1' }] as never);
    mockRepos.policyAttribute.getPolicyAttributes.mockResolvedValueOnce([
      { groupId: [], attributeName: 'global:permission' },
      { groupId: [1], attributeName: 'group:permission' },
      { groupId: [2], attributeName: 'other:permission' }
    ] as never);

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.attributes).toEqual(['global:permission', 'group:permission']);
  });

  it('handles non-Error exceptions gracefully', async () => {
    mockRepos.user.findBySub.mockImplementation(() => {
      throw 'String exception'; // nosonar
    });

    const res = await request(
      buildAppForHasAuthorization({ tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING })
    ).get('/test');

    expect(res.status).toBe(403);
  });

  it('sets currentContext to undefined and calls next when no currentContext', async () => {
    const res = await request(buildAppForHasAuthorization(undefined)).get('/test');

    expect(res.status).toBe(403);
    expect(res.body.detail).toBe('No current user');
  });

  it('freezes currentAuthorization object to prevent mutations', async () => {
    mockRepos.user.findBySub.mockResolvedValueOnce(USER_ID as never);
    mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([{ groupId: 1, name: GroupName.DEVELOPER }] as never);

    // Build app with custom route handler to test freeze behavior
    const app = express();
    app.use((_req, res, next) => {
      res.locals.currentContext = { tokenPayload: { sub: SUB }, initiative: Initiative.HOUSING };
      next();
    });
    app.get('/test', hasAuthorization('document', 'read'), (_req: Request, res: Response) => {
      const isFrozen = Object.isFrozen(res.locals.currentAuthorization);
      res.status(200).json({ frozen: isFrozen });
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
      res.status(err.status || 500).json({ detail: err.detail });
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
    expect(res.body.frozen).toBe(true);
  });
});
