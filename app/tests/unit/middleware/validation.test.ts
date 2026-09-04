import express from 'express';
import request from 'supertest';
import { z } from 'zod';

import { validate } from '#src/middleware/validation';

import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import type Problem from '#src/utils/problem';

function buildApp(schema: Record<string, ZodType>) {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.post('/echo', validate(schema), (req: Request, res: Response) => {
    res.status(201).json(req.body);
  });

  app.get('/echo-query', validate(schema), (req: Request, res: Response) => {
    res.status(200).json(req.query);
  });

  app.get('/echo-params/:id', validate(schema), (req: Request, res: Response) => {
    res.status(200).json(req.params);
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
      body: z.object({ name: z.string() })
    });

    const res = await request(app).post('/echo').send({ name: 'jane' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ name: 'jane' });
  });

  it('responds with 422 and aggregated detail when validation fails', async () => {
    const app = buildApp({
      body: z.object({
        name: z.string(),
        age: z.number()
      })
    });

    const res = await request(app).post('/echo').send({});

    expect(res.status).toBe(422);
    expect(res.body.detail.split('; ')).toHaveLength(2);
  });

  it('skips schema entries that pass and reports only failing properties', async () => {
    const app = buildApp({
      body: z.object({ name: z.string() }),
      query: z.object({ q: z.string() })
    });

    const res = await request(app).post('/echo?q=ok').send({});

    expect(res.status).toBe(422);
    expect(res.body.detail.split('; ')).toHaveLength(1);
  });

  it('writes defaulted fields back onto req.body so downstream handlers see them', async () => {
    const app = buildApp({
      body: z.object({
        name: z.string(),
        active: z.boolean().default(true)
      })
    });

    const res = await request(app).post('/echo').send({ name: 'jane' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ name: 'jane', active: true });
  });

  it('writes coerced/transformed fields back onto req.body', async () => {
    const app = buildApp({
      body: z.object({
        count: z.coerce.number()
      })
    });

    const res = await request(app).post('/echo').send({ count: '42' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ count: 42 });
  });

  it('writes coerced/defaulted fields back onto req.query, not just req.body', async () => {
    // req.query is a getter-only, recomputed-per-access property under Express 5 - this is the
    // regression case for that (plain assignment or in-place mutation both silently no-op there).
    const app = buildApp({
      query: z.object({
        includeNotes: z.preprocess((v) => v === 'true', z.boolean()),
        take: z.coerce.number().default(10)
      })
    });

    const res = await request(app).get('/echo-query?includeNotes=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ includeNotes: true, take: 10 });
  });

  it('writes validated fields back onto req.params', async () => {
    const app = buildApp({
      params: z.object({ id: z.coerce.number() })
    });

    const res = await request(app).get('/echo-params/123');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 123 });
  });
});
