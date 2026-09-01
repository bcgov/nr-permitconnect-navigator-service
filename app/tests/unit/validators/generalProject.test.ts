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

  it('requires registeredName when projectApplicantType is Business', async () => {
    const res = await request(app)
      .post('/')
      .send({ basic: { projectApplicantType: 'Business', projectName: 'Test Project' } });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"registeredName" is required/);
  });

  it('passes when projectApplicantType is Business and registeredName is provided', async () => {
    const res = await request(app)
      .post('/')
      .send({ basic: { projectApplicantType: 'Business', projectName: 'Test Project', registeredName: 'Acme' } });
    expect(res.status).toBe(200);
  });

  it('does not require registeredName when projectApplicantType is Individual', async () => {
    const res = await request(app)
      .post('/')
      .send({ basic: { projectApplicantType: 'Individual', projectName: 'Test Project' } });
    expect(res.status).toBe(200);
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
