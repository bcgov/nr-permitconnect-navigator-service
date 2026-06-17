import express from 'express';
import request from 'supertest';

import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1, TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { requireActivityAdmin } from '../../../src/middleware/requireActivityAdmin.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import * as contactService from '../../../src/services/contact.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp(locals?: Record<string, unknown>) {
  const app = express();

  app.use((req, res, next) => {
    Object.assign(res.locals, locals);
    next();
  });

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requireActivityAdmin);

  // Endpoints
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

beforeEach(() => {
  vi.clearAllMocks();
});

describe('requireActivityAdmin middleware', () => {
  let app: express.Express;

  const searchContactsSpy = vi.spyOn(contactService, 'searchContacts');
  const listActivityContactsSpy = vi.spyOn(activityContactService, 'listActivityContacts');

  describe('scope:all', () => {
    beforeEach(() => {
      app = buildApp({
        currentContext: TEST_CURRENT_CONTEXT,
        currentAuthorization: {
          attributes: ['scope:all'],
          groups: []
        }
      });
    });

    it('immediately calls next', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);

      const res = await request(app)
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'PRIMARY' });

      expect(searchContactsSpy).toHaveBeenCalledTimes(0);
      expect(listActivityContactsSpy).toHaveBeenCalledTimes(0);
      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'PRIMARY' });
    });
  });

  describe('scope:self', () => {
    beforeEach(() => {
      app = buildApp({
        currentContext: TEST_CURRENT_CONTEXT,
        currentAuthorization: {
          attributes: ['scope:self'],
          groups: []
        }
      });
    });

    it('allows PRIMARY through', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);

      const res = await request(app)
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'PRIMARY' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'PRIMARY' });
    });

    it('allows ADMIN through', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([{ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN }]);

      const res = await request(app)
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'ADMIN' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ role: 'ADMIN' });
    });

    it('does not allow MEMBER through', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([{ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.MEMBER }]);

      const res = await request(app)
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'MEMBER' });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({
        detail: 'User lacks required role.'
      });
    });

    it('does not allow a non contact through', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([]);

      const res = await request(app)
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
