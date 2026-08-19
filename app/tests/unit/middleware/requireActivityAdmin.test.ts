import express from 'express';
import request from 'supertest';

import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1, TEST_CURRENT_CONTEXT } from '#tests/unit/data/index';
import { mockRepos } from '#tests/__mocks__/unitOfWorkMock';
import { requireActivityAdmin } from '#src/middleware/requireActivityAdmin';
import { ActivityContactRole } from '#src/utils/enums/projectCommon';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '#src/utils/problem';

function buildApp(locals?: Record<string, unknown>) {
  const app = express();
  app.use((req, res, next) => {
    Object.assign(res.locals, locals);
    next();
  });
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requireActivityAdmin);
  app.post('/echo/:activityId/contact/:contactId', (req: Request, res: Response) => {
    res.status(201).json(req.body);
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({
      detail: err.detail,
      instance: err.instance
    });
  });
  return app;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('requireActivityAdmin middleware', () => {
  describe('scope:all', () => {
    it('immediately calls next', async () => {
      const res = await request(
        buildApp({
          currentContext: TEST_CURRENT_CONTEXT,
          currentAuthorization: {
            attributes: ['scope:all'],
            groups: []
          }
        })
      )
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'PRIMARY' });

      expect(mockRepos.contact.search).not.toHaveBeenCalled();
      expect(mockRepos.activityContact.findMany).not.toHaveBeenCalled();
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'PRIMARY' });
    });
  });

  describe('scope:self', () => {
    it('allows PRIMARY through', async () => {
      mockRepos.subjectGroup.subjectHasInitiativeGroupName.mockResolvedValueOnce(false as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.findMany.mockResolvedValueOnce([TEST_ACTIVITY_CONTACT_1] as never);

      const res = await request(
        buildApp({
          currentContext: TEST_CURRENT_CONTEXT,
          currentAuthorization: {
            attributes: ['scope:self'],
            groups: []
          }
        })
      )
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'PRIMARY' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'PRIMARY' });
    });

    it('allows ADMIN through', async () => {
      mockRepos.subjectGroup.subjectHasInitiativeGroupName.mockResolvedValueOnce(false as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.findMany.mockResolvedValueOnce([
        { ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN }
      ] as never);

      const res = await request(
        buildApp({
          currentContext: TEST_CURRENT_CONTEXT,
          currentAuthorization: {
            attributes: ['scope:self'],
            groups: []
          }
        })
      )
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'ADMIN' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'ADMIN' });
    });

    it('does not allow MEMBER through', async () => {
      mockRepos.subjectGroup.subjectHasInitiativeGroupName.mockResolvedValueOnce(false as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.findMany.mockResolvedValueOnce([
        { ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.MEMBER }
      ] as never);

      const res = await request(
        buildApp({
          currentContext: TEST_CURRENT_CONTEXT,
          currentAuthorization: {
            attributes: ['scope:self'],
            groups: []
          }
        })
      )
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'MEMBER' });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        detail: 'User lacks required role.'
      });
    });

    it('does not allow a non contact through', async () => {
      mockRepos.subjectGroup.subjectHasInitiativeGroupName.mockResolvedValueOnce(false as never);
      mockRepos.contact.search.mockResolvedValueOnce([TEST_CONTACT_1] as never);
      mockRepos.activityContact.findMany.mockResolvedValueOnce([] as never);

      const res = await request(
        buildApp({
          currentContext: TEST_CURRENT_CONTEXT,
          currentAuthorization: {
            attributes: ['scope:self'],
            groups: []
          }
        })
      )
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'MEMBER' });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        detail: 'User lacks required role.'
      });
    });
  });
});
