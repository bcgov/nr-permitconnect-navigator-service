import express from 'express';
import request from 'supertest';
import { existsSync, readFileSync } from 'node:fs';

import { hasIdentity } from '../../../src/middleware/identity.ts';
import { IdentityProviderKind } from '../../../src/utils/enums/application.ts';
import { TEST_CURRENT_CONTEXT } from '../data/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { CurrentContext } from '../../../src/types/stuff';

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn()
}));

jest.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ warn: jest.fn(), info: jest.fn(), error: jest.fn(), verbose: jest.fn() })
}));

const IDP_LIST = [
  {
    idp: IdentityProviderKind.IDIR,
    kind: 'idir',
    username: 'idir_username'
  }
];

function buildApp(kind: IdentityProviderKind, contextPayloadOverride?: CurrentContext) {
  const app = express();
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    req.currentContext = {
      ...TEST_CURRENT_CONTEXT,
      ...contextPayloadOverride
    };
    next();
  });

  app.get(
    '/test',
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await hasIdentity(kind)(req, res, next);
      } catch (err) {
        next(err);
      }
    },
    (req: Request, res: Response) => {
      res.status(200).json({ ok: true });
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error & { status?: number; detail?: string }, req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail || err.message });
  });

  return app;
}

describe('hasIdentity middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (existsSync as jest.Mock).mockReturnValue(true);
    (readFileSync as jest.Mock).mockReturnValue(JSON.stringify(IDP_LIST));
  });

  it('calls next and allows the request if the user has the required identity', async () => {
    const app = buildApp(IdentityProviderKind.IDIR, {
      tokenPayload: { identity_provider: IdentityProviderKind.IDIR }
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('throws a 403 Problem if the user does not have the required identity', async () => {
    const app = buildApp(IdentityProviderKind.IDIR, {
      tokenPayload: { identity_provider: IdentityProviderKind.BCEID } // Mismatch
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ detail: 'Invalid user identity' });
  });

  it('throws a 403 Problem if the token payload is missing entirely', async () => {
    const app = buildApp(IdentityProviderKind.IDIR, {
      tokenPayload: undefined
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ detail: 'Invalid user identity' });
  });
});
