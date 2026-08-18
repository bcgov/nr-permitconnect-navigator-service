import express from 'express';
import request from 'supertest';

import { enquiryValidator } from '../../../src/validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp() {
  const app = express();
  app.use(express.json());

  app.patch('/:enquiryId', enquiryValidator.patchEnquiry, (req: Request, res: Response) =>
    res.status(200).json(req.body)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

const validParams = '/5183f223-526a-44cf-8b6a-80f90c4e802b';

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
