import express from 'express';
import request from 'supertest';

import { enquiryValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/', enquiryValidator.createEnquiry, (req: Request, res: Response) => res.status(200).json(req.body));

  app.patch('/:enquiryId', enquiryValidator.patchEnquiry, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );

  app.get('/:enquiryId', enquiryValidator.getEnquiry, (req: Request, res: Response) =>
    res.status(200).json(req.params)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

describe('createEnquiry validator', () => {
  const app = buildApp();

  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };

  it('passes with just a contact (staff nav "create new" flow sends no other fields)', async () => {
    const res = await request(app).post('/').send({ contact: validContact });
    expect(res.status).toBe(200);
  });

  it('passes with contact and enquiryDescription/relatedActivityId (citizen intake flow)', async () => {
    const res = await request(app)
      .post('/')
      .send({ contact: validContact, enquiryDescription: 'Test enquiry', relatedActivityId: 'ACTI1234' });
    expect(res.status).toBe(200);
  });

  it('requires contact', async () => {
    const res = await request(app).post('/').send({});
    expect(res.status).toBe(422);
  });

  it('requires contactId on contact', async () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const res = await request(app).post('/').send({ contact: contactWithoutId });
    expect(res.status).toBe(422);
  });

  it('requires contactPreference on contact', async () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const res = await request(app).post('/').send({ contact: contactWithoutPreference });
    expect(res.status).toBe(422);
  });

  it('rejects unrecognized fields on contact', async () => {
    const res = await request(app)
      .post('/')
      .send({ contact: { ...validContact, notARealField: true } });
    expect(res.status).toBe(422);
  });
});

describe('patchEnquiry validator', () => {
  const app = buildApp();

  it('passes with an empty body', async () => {
    const res = await request(app).patch(validParams).send({});
    expect(res.status).toBe(200);
  });

  it('passes with a single partial field', async () => {
    const res = await request(app).patch(validParams).send({ enquiryDescription: 'Updated description' });
    expect(res.status).toBe(200);
  });

  it('passes without addedToAts (optional)', async () => {
    const res = await request(app).patch(validParams).send({ enquiryStatus: 'New' });
    expect(res.status).toBe(200);
  });

  it('accepts addedToAts as a boolean when supplied', async () => {
    const res = await request(app).patch(validParams).send({ addedToAts: true });
    expect(res.status).toBe(200);
  });
});

describe('getEnquiry validator', () => {
  const app = buildApp();

  it('passes with a valid uuid enquiryId', async () => {
    const res = await request(app).get(validParams);
    expect(res.status).toBe(200);
  });

  it('rejects a non-uuid enquiryId', async () => {
    const res = await request(app).get('/not-a-uuid');
    expect(res.status).toBe(422);
  });
});
