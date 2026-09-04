import express from 'express';
import request from 'supertest';

import { generalProjectValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/', generalProjectValidator.createGeneralProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );
  app.post('/draft/submit', generalProjectValidator.submitGeneralProjectDraft, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );
  app.patch('/:generalProjectId', generalProjectValidator.patchGeneralProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

describe('createGeneralProject validator', () => {
  const app = buildApp();

  it('accepts an empty body', async () => {
    const res = await request(app).post('/').send({});
    expect(res.status).toBe(200);
    expect(res.body).toEqual({});
  });

  it('rejects unrecognized fields', async () => {
    const res = await request(app).post('/').send({ notARealField: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'notARealField'/);
  });
});

describe('submitGeneralProjectDraft validator', () => {
  const app = buildApp();

  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };
  const validLocation = {
    naturalDisaster: 'No',
    projectLocation: 'Location coordinates',
    latitude: 49,
    longitude: -123
  };
  const validPermits = { hasAppliedProvincialPermits: 'No' };

  function validBody(basic: Record<string, unknown>) {
    return {
      contact: validContact,
      basic,
      location: validLocation,
      permits: validPermits
    };
  }

  it('requires registeredName when projectApplicantType is Business', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(validBody({ projectApplicantType: 'Business', projectName: 'Test Project', projectDescription: 'Desc' }));
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"registeredName" is required/);
  });

  it('passes when projectApplicantType is Business and registeredName is provided', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(
        validBody({
          projectApplicantType: 'Business',
          projectName: 'Test Project',
          projectDescription: 'Desc',
          registeredName: 'Acme'
        })
      );
    expect(res.status).toBe(200);
  });

  it('does not require registeredName when projectApplicantType is Individual', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(validBody({ projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' }));
    expect(res.status).toBe(200);
  });

  it('requires basic, contact, location, and permits', async () => {
    const res = await request(app).post('/draft/submit').send({});
    expect(res.status).toBe(422);
  });

  it('requires contactId on contact', async () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: contactWithoutId,
        basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });

  it('requires contactPreference on contact', async () => {
    const contactWithoutPreference: Record<string, unknown> = { ...validContact };
    delete contactWithoutPreference.contactPreference;
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: contactWithoutPreference,
        basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });

  it('rejects unrecognized fields on contact', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: { ...validContact, notARealField: true },
        basic: { projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' },
        location: validLocation,
        permits: validPermits
      });
    expect(res.status).toBe(422);
  });

  it('rejects a general field (dead, never sent by the frontend)', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        ...validBody({ projectApplicantType: 'Individual', projectName: 'Test Project', projectDescription: 'Desc' }),
        general: { projectName: 'Test Project', projectDescription: 'Desc' }
      });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'general'/);
  });
});

describe('patchGeneralProject validator', () => {
  const app = buildApp();

  it('passes with an empty body', async () => {
    const res = await request(app).patch(validParams).send({});
    expect(res.status).toBe(200);
  });

  it('passes with a single partial field', async () => {
    const res = await request(app).patch(validParams).send({ projectName: 'Updated Name' });
    expect(res.status).toBe(200);
  });

  it('accepts naturalDisaster as a boolean', async () => {
    const res = await request(app).patch(validParams).send({ naturalDisaster: true });
    expect(res.status).toBe(200);
  });

  it('rejects addedToAts, which does not exist on general_project', async () => {
    const res = await request(app).patch(validParams).send({ addedToAts: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'addedToAts'/);
  });

  it('passes with atsClientId and atsEnquiryId', async () => {
    const res = await request(app).patch(validParams).send({ atsClientId: 1, atsEnquiryId: 2 });
    expect(res.status).toBe(200);
  });
});
