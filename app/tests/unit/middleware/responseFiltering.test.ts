import express from 'express';
import request from 'supertest';

import { TEST_CONTACT_1, TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { filterActivityResponseByScope } from '../../../src/middleware/responseFiltering.ts';
import * as contactService from '../../../src/services/contact.ts';

import type { Request, Response } from 'express';

function buildApp() {
  const app = express();
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(filterActivityResponseByScope);

  // Endpoints
  app.get('/array/:activityId', (req: Request, res: Response) => {
    res.status(200).json([
      {
        activity: {
          activityContact: [
            {
              contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f'
            }
          ]
        }
      },
      {
        activity: {
          activityContact: [
            {
              contactId: '811896a0-e1fe-4c38-8cd3-86245c79e8f8'
            }
          ]
        }
      }
    ]);
  });

  app.get('/object/:activityId', (req: Request, res: Response) => {
    res.status(200).json({
      activity: {
        activityContact: [
          {
            contactId: '811896a0-e1fe-4c38-8cd3-86245c79e8f8'
          }
        ]
      }
    });
  });

  return app;
}

describe('filterActivityResponseByScope middleware', () => {
  let app: express.Express;

  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');

  beforeEach(() => {
    app = buildApp();
    app.request.currentContext = TEST_CURRENT_CONTEXT;
  });

  describe('scope:self attribute present', () => {
    it('filters array response', async () => {
      app.request.currentAuthorization = {
        attributes: ['scope:self'],
        groups: []
      };

      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

      const res = await request(app).get('/array/1').set('content-type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          activity: {
            activityContact: [
              {
                contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f'
              }
            ]
          }
        }
      ]);
    });

    it('filters object response', async () => {
      app.request.currentAuthorization = {
        attributes: ['scope:self'],
        groups: []
      };

      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

      const res = await request(app).get('/object/1').set('content-type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({});
    });
  });

  describe('scope:all attribute present', () => {
    it('does not filter response', async () => {
      app.request.currentAuthorization = {
        attributes: ['scope:all'],
        groups: []
      };

      searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

      const res = await request(app).get('/array/1').set('content-type', 'application/json');

      expect(res.status).toBe(200);
      expect(res.body).toEqual([
        {
          activity: {
            activityContact: [
              {
                contactId: '59b6bad3-ed3c-43f6-81f9-bbd1609d880f'
              }
            ]
          }
        },
        {
          activity: {
            activityContact: [
              {
                contactId: '811896a0-e1fe-4c38-8cd3-86245c79e8f8'
              }
            ]
          }
        }
      ]);
    });
  });

  it('returns 403 when an error happens', async () => {
    app.request.currentAuthorization = {
      attributes: ['scope:self'],
      groups: []
    };

    searchContactsSpy.mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const res = await request(app).get('/object/1').set('content-type', 'application/json');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({});
  });
});
