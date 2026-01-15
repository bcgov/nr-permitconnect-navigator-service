import express from 'express';
import request from 'supertest';

import { requestSanitizer } from '../../../src/middleware/requestSanitizer.ts';

import type { Request, Response } from 'express';

function buildApp() {
  const app = express();
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestSanitizer);

  // Endpoints to inspect sanitized body
  app.post('/echo', (req: Request, res: Response) => {
    res.status(200).json(req.body);
  });

  app.get('/ping', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  return app;
}

describe('requestSanitizer middleware', () => {
  let app: express.Express;
  beforeEach(() => {
    app = buildApp();
  });

  it('removes NUL written as \\0 (octal) inside JSON body', async () => {
    const res = await request(app).post('/echo').send({ s: 'hello\0world' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ s: 'helloworld' });
  });

  it('removes NUL written as \\x00 (hex) inside JSON body', async () => {
    const res = await request(app).post('/echo').send({ s: 'hello\x00world' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ s: 'helloworld' });
  });

  it('removes NUL written as \\u0000 (unicode escape) inside JSON body', async () => {
    const res = await request(app).post('/echo').send({ s: 'hello\u0000world' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ s: 'helloworld' });
  });

  it('removes NUL written as \\u{0} (unicode code point) inside JSON body', async () => {
    const res = await request(app).post('/echo').send({ s: 'hello\u{0}world' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ s: 'helloworld' });
  });

  it('strips NULs from flat string fields (application/json)', async () => {
    const payload = { name: 'a\u0000b\u0000c', city: 'Victoria' };

    const res = await request(app).post('/echo').set('content-type', 'application/json').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'abc', city: 'Victoria' });
  });

  it('recursively strips NULs inside nested objects/arrays', async () => {
    const payload = {
      id: 123,
      meta: {
        note: 'he\u0000llo',
        tags: ['x', 'y\u0000', 'z'],
        nested: [{ a: '1\u0000' }, { b: '2' }]
      },
      flags: { active: true, count: 0, nullable: null }
    };

    const res = await request(app).post('/echo').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 123,
      meta: {
        note: 'hello',
        tags: ['x', 'y', 'z'],
        nested: [{ a: '1' }, { b: '2' }]
      },
      flags: { active: true, count: 0, nullable: null }
    });
  });

  it('recursively removes NULs from arrays/objects using mixed notations', async () => {
    const payload = {
      arr: ['a\0', 'b\x00', 'c\u0000', 'd\u{0}'],
      obj: {
        x: '\0x',
        y: 'y\x00',
        z: 'z\u0000',
        w: 'w\u{0}'
      }
    };

    const res = await request(app).post('/echo').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      arr: ['a', 'b', 'c', 'd'],
      obj: { x: 'x', y: 'y', z: 'z', w: 'w' }
    });
  });

  it('does not alter numbers/booleans/null/undefined fields', async () => {
    const payload = {
      n: 42,
      f: false,
      t: true,
      nil: null,
      undef: undefined,
      s: '\u0000ok\u0000'
    };

    const res = await request(app).post('/echo').send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ n: 42, f: false, t: true, nil: null, s: 'ok' });
    expect('undef' in res.body).toBe(false);
  });

  it('works with application/x-www-form-urlencoded', async () => {
    const res = await request(app)
      .post('/echo')
      .set('content-type', 'application/x-www-form-urlencoded')
      .send('a=a%00a&b=b&arr=x&arr=y%00');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ a: 'aa', b: 'b', arr: ['x', 'y'] });
  });

  it('GET with no body is a no-op (does not throw)', async () => {
    const res = await request(app).get('/ping');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('large strings with no NULs are returned as-is', async () => {
    const big = 'x'.repeat(10000);
    const res = await request(app).post('/echo').send({ big });

    expect(res.status).toBe(200);
    expect(res.body.big).toHaveLength(10000);
    expect(res.body.big).toBe(big);
  });

  it('multiple NULs in a single string are all removed', async () => {
    const res = await request(app).post('/echo').send({ s: '\u0000\u0000A\u0000B\u0000\u0000' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ s: 'AB' });
  });
});
