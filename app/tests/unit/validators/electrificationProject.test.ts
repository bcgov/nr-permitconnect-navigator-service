import express from 'express';
import request from 'supertest';

import { electrificationProjectValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.post('/', electrificationProjectValidator.createElectrificationProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );
  app.post(
    '/draft/submit',
    electrificationProjectValidator.submitElectrificationProjectDraft,
    (req: Request, res: Response) => res.status(200).json(req.body)
  );
  app.patch(
    '/:electrificationProjectId',
    electrificationProjectValidator.patchElectrificationProject,
    (req: Request, res: Response) => res.status(200).json(req.body)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

describe('createElectrificationProject validator', () => {
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

describe('submitElectrificationProjectDraft validator', () => {
  const app = buildApp();

  const validContact = {
    contactId: '5183f223-526a-44cf-8b6a-80f90c4e802b',
    email: 'test@example.com',
    firstName: 'Jane',
    phoneNumber: '778-555-1234',
    contactApplicantRelationship: 'Property owner',
    contactPreference: 'Email'
  };

  function validBody(project: Record<string, unknown>) {
    return {
      contact: validContact,
      basic: { projectName: 'Test', registeredName: 'Acme' },
      project
    };
  }

  it('requires projectDescription when projectType is OTHER', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(validBody({ projectType: 'OTHER' }));
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"projectDescription" is required/);
  });

  it('passes when projectType is OTHER and projectDescription is provided', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: validContact,
        basic: { projectName: 'Test', registeredName: 'Acme', projectDescription: 'desc' },
        project: { projectType: 'OTHER' }
      });
    expect(res.status).toBe(200);
  });

  it('does not require projectDescription for a non-OTHER projectType', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send(validBody({ projectType: 'IPP_SOLAR' }));
    expect(res.status).toBe(200);
  });

  it('requires basic, contact, and project', async () => {
    const res = await request(app).post('/draft/submit').send({});
    expect(res.status).toBe(422);
  });

  it('requires registeredName on basic', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: validContact,
        basic: { projectName: 'Test' },
        project: { projectType: 'IPP_SOLAR' }
      });
    expect(res.status).toBe(422);
  });

  it('requires contactId on contact', async () => {
    const contactWithoutId: Record<string, unknown> = { ...validContact };
    delete contactWithoutId.contactId;
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: contactWithoutId,
        basic: { projectName: 'Test', registeredName: 'Acme' },
        project: { projectType: 'IPP_SOLAR' }
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
        basic: { projectName: 'Test', registeredName: 'Acme' },
        project: { projectType: 'IPP_SOLAR' }
      });
    expect(res.status).toBe(422);
  });

  it('rejects unrecognized fields on contact', async () => {
    const res = await request(app)
      .post('/draft/submit')
      .send({
        contact: { ...validContact, notARealField: true },
        basic: { projectName: 'Test', registeredName: 'Acme' },
        project: { projectType: 'IPP_SOLAR' }
      });
    expect(res.status).toBe(422);
  });
});

describe('patchElectrificationProject validator', () => {
  const app = buildApp();

  it('passes with an empty body', async () => {
    const res = await request(app).patch(validParams).send({});
    expect(res.status).toBe(200);
  });

  it('passes with a single partial field', async () => {
    const res = await request(app).patch(validParams).send({ projectName: 'Updated Name' });
    expect(res.status).toBe(200);
  });

  it('passes without addedToAts (optional)', async () => {
    const res = await request(app).patch(validParams).send({ queuePriority: 1 });
    expect(res.status).toBe(200);
  });

  it('still requires projectDescription when projectType is OTHER', async () => {
    const res = await request(app).patch(validParams).send({ projectType: 'OTHER' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"projectDescription" is required/);
  });
});
