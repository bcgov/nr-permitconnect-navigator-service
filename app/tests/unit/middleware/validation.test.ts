import express from 'express';
import Joi from 'joi';
import request from 'supertest';

import { validate } from '../../../src/middleware/validation.ts';

import type { NextFunction, Request, Response } from 'express';
import type Problem from '../../../src/utils/problem.ts';

function buildApp(schema: object) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/echo', validate(schema), (req: Request, res: Response) => {
    res.status(201).json(req.body);
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail });
  });

  return app;
}

describe('validate middleware', () => {
  it('calls next when all schemas pass', async () => {
    const app = buildApp({
      body: Joi.object({ name: Joi.string().required() })
    });

    const res = await request(app).post('/echo').send({ name: 'jane' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ name: 'jane' });
  });

  it('responds with 422 and aggregated detail when validation fails', async () => {
    const app = buildApp({
      body: Joi.object({
        name: Joi.string().required(),
        age: Joi.number().required()
      })
    });

    const res = await request(app).post('/echo').send({});

    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"name" is required/);
    expect(res.body.detail).toMatch(/"age" is required/);
  });

  it('skips schema entries that pass and reports only failing properties', async () => {
    const app = buildApp({
      body: Joi.object({ name: Joi.string().required() }),
      query: Joi.object({ q: Joi.string().required() })
    });

    const res = await request(app).post('/echo?q=ok').send({});

    expect(res.status).toBe(422);
    expect(res.body.detail).toMatch(/"name" is required/);
    expect(res.body.detail).not.toMatch(/"q"/);
  });
});
