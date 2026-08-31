import express from 'express';
import request from 'supertest';

import { housingProjectValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.patch('/:housingProjectId', housingProjectValidator.patchHousingProject, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

describe('patchHousingProject validator', () => {
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

  it('rejects naturalDisaster as a string', async () => {
    const res = await request(app).patch(validParams).send({ naturalDisaster: 'No' });
    expect(res.status).toBe(422);
  });

  it('still enforces otherUnits when otherUnitsDescription is Yes', async () => {
    const res = await request(app).patch(validParams).send({ otherUnitsDescription: 'Yes' });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"otherUnits" is required/);
  });

  it('rejects fields not in the patchable schema', async () => {
    const res = await request(app).patch(validParams).send({ notARealField: true });
    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/Unrecognized key\(s\) in object: 'notARealField'/);
  });
});
