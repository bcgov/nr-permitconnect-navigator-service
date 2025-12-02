import express, { Request, Response } from 'express';
import request from 'supertest';

import { requireActivityAdmin } from '../../../src/middleware/requireActivityAdmin';
import * as contactService from '../../../src/services/contact';
import * as activityContactService from '../../../src/services/activityContact';

import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1, TEST_CURRENT_CONTEXT } from '../data';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon';

function buildApp() {
  const app = express();
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requireActivityAdmin);

  // Endpoints
  app.post('/echo/:activityId/contact/:contactId', (req: Request, res: Response) => {
    res.status(201).json(req.body);
  });

  return app;
}

describe('requireActivityAdmin middleware', () => {
  let app: express.Express;

  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const listActivityContactsSpy = jest.spyOn(activityContactService, 'listActivityContacts');

  beforeEach(() => {
    app = buildApp();
    app.request.currentContext = TEST_CURRENT_CONTEXT;
  });

  describe('scope:all', () => {
    beforeEach(() => {
      app.request.currentAuthorization = { attributes: ['scope:all'], groups: [] };
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
      app.request.currentAuthorization = { attributes: ['scope:self'], groups: [] };
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
      expect(res.body).toEqual({});
    });

    it('does not allow a non contact through', async () => {
      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
      listActivityContactsSpy.mockResolvedValue([]);

      const res = await request(app)
        .post('/echo/1/contact/2')
        .set('content-type', 'application/json')
        .send({ role: 'MEMBER' });

      expect(res.status).toBe(403);
      expect(res.body).toEqual({});
    });
  });
});
