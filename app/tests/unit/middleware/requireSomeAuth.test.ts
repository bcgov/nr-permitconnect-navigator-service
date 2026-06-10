import config from 'config';
import express from 'express';
import request from 'supertest';

import { requireSomeAuth } from '../../../src/middleware/requireSomeAuth.ts';
import { AuthType } from '../../../src/utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Mocked } from 'vitest';
import type Problem from '../../../src/utils/problem.ts';

vi.mock('config');
const mockedConfig = config as Mocked<typeof config>;

function buildApp(currentContext: unknown) {
  const app = express();
  app.use((req, _res, next) => {
    (req as Request).currentContext = currentContext as Request['currentContext'];
    next();
  });
  app.use(requireSomeAuth);
  app.get('/ok', (_req, res) => res.status(200).json({ ok: true }));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Problem, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail, instance: err.instance });
  });
  return app;
}

beforeEach(() => {
  mockedConfig.get.mockImplementation((key: string) => {
    if (key === 'server.oidc.audience') return 'pcns-audience';
    return '';
  });
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('requireSomeAuth middleware', () => {
  it('responds with 401 and WWW-Authenticate when currentContext is missing', async () => {
    const res = await request(buildApp(undefined)).get('/ok');

    expect(res.status).toBe(401);
    expect(res.body.detail).toBe('Missing authentication');
    expect(res.headers['www-authenticate']).toContain('pcns-audience');
  });

  it('responds with 401 when authType is NONE', async () => {
    const res = await request(buildApp({ authType: AuthType.NONE })).get('/ok');

    expect(res.status).toBe(401);
    expect(res.body.detail).toBe('Missing authentication');
  });

  it('calls next when authType is set', async () => {
    const res = await request(buildApp({ authType: AuthType.BEARER })).get('/ok');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});
