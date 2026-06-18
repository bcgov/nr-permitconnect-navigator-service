import express from 'express';
import request from 'supertest';
import { existsSync, readFileSync } from 'node:fs';

import { TEST_CURRENT_CONTEXT } from '../data/index.ts';
import { hasIdentity } from '../../../src/middleware/identity.ts';
import { AuthType, IdentityProviderKind, Initiative } from '../../../src/utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { CurrentContext } from '../../../src/types/stuff';
import type Problem from '../../../src/utils/problem.ts';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

vi.mock('config', () => ({
  has: vi.fn(),
  get: vi.fn()
}));

vi.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ warn: vi.fn(), info: vi.fn(), error: vi.fn(), verbose: vi.fn() })
}));

const IDP_LIST = [
  {
    idp: IdentityProviderKind.AZUREIDIR,
    kind: 'azureidir',
    username: 'idir_username'
  }
];

function buildApp(kind: IdentityProviderKind, contextPayloadOverride?: CurrentContext) {
  const app = express();
  app.use(express.json());

  app.use((req: Request, res: Response, next: NextFunction) => {
    res.locals.currentContext = {
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
  app.use((err: Problem, req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ detail: err.detail || err.message });
  });

  return app;
}

describe('hasIdentity middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (existsSync as Mock).mockReturnValue(true);
    (readFileSync as Mock).mockReturnValue(JSON.stringify(IDP_LIST));
  });

  it('calls next and allows the request if the user has the required identity', async () => {
    const app = buildApp(IdentityProviderKind.AZUREIDIR, {
      authType: AuthType.BEARER,
      initiative: Initiative.PCNS,
      tokenPayload: { identity_provider: IdentityProviderKind.AZUREIDIR }
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('throws a 403 Problem if the user does not have the required identity', async () => {
    const app = buildApp(IdentityProviderKind.AZUREIDIR, {
      authType: AuthType.BEARER,
      initiative: Initiative.PCNS,
      tokenPayload: { identity_provider: IdentityProviderKind.BCEID } // Mismatch
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ detail: 'Invalid user identity' });
  });

  it('throws a 403 Problem if the token payload is missing entirely', async () => {
    const app = buildApp(IdentityProviderKind.AZUREIDIR, {
      authType: AuthType.NONE,
      initiative: Initiative.PCNS,
      tokenPayload: undefined
    });

    const res = await request(app).get('/test');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ detail: 'Invalid user identity' });
  });
});
