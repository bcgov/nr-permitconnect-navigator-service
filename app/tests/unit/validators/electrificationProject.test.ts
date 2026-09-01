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

  it('requires projectDescription when projectType is OTHER', async () => {
    const res = await request(app)
      .post('/')
      .send({ project: { projectType: 'OTHER' } });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"projectDescription" is required/);
  });

  it('passes when projectType is OTHER and projectDescription is provided', async () => {
    const res = await request(app)
      .post('/')
      .send({ project: { projectType: 'OTHER' }, basic: { projectName: 'Test', projectDescription: 'desc' } });
    expect(res.status).toBe(200);
  });

  it('does not require projectDescription for a non-OTHER projectType', async () => {
    const res = await request(app)
      .post('/')
      .send({ project: { projectType: 'IPP_SOLAR' } });
    expect(res.status).toBe(200);
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
