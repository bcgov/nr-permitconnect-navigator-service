import jwt from 'jsonwebtoken';

import { getVerifiedPayload, hasAuthentication, jwtPayloadCache } from '#src/middleware/authentication';
import * as oidcProviders from '#src/middleware/providers/oidc';
import { loginService } from '#src/services/login';
import { AuthType, IdentityProviderKind, Initiative } from '#src/utils/enums/application';
import { Problem } from '#src/utils/index';

import type { NextFunction, Request, Response } from 'express';

const AUDIENCE = 'nr-permitting-connect-test';
const AUTHORITY = 'https://auth.example.com';
const INITIATIVE = Initiative.PCNS;

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.oidc.audience') return AUDIENCE;
        if (key === 'server.oidc.authority') return AUTHORITY;
        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

vi.mock('jsonwebtoken', () => {
  const mock = {
    decode: vi.fn(),
    verify: vi.fn()
  };
  return { default: mock, ...mock };
});

vi.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ error: vi.fn() })
}));

vi.mock('../../../src/middleware/providers/oidc', () => ({
  getAuthHeader: vi.fn(),
  getBearerToken: vi.fn(),
  getJwksClient: vi.fn(),
  setAuthHeader: vi.fn()
}));

vi.mock('../../../src/services/login', () => ({
  loginService: vi.fn()
}));

describe('authentication middleware', () => {
  const mockedJwtDecode = vi.mocked(jwt.decode);
  const mockedJwtVerify = vi.mocked(jwt.verify);
  const mockedGetAuthHeader = vi.mocked(oidcProviders.getAuthHeader);
  const mockedGetBearerToken = vi.mocked(oidcProviders.getBearerToken);
  const mockedGetJwksClient = vi.mocked(oidcProviders.getJwksClient);
  const mockedSetAuthHeader = vi.mocked(oidcProviders.setAuthHeader);
  const mockedLogin = vi.mocked(loginService);

  beforeEach(() => {
    vi.clearAllMocks();
    jwtPayloadCache.clear();
  });

  describe('hasAuthentication', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = { originalUrl: '/test' };
      res = {
        locals: {}
      };
      next = vi.fn();
    });

    it('sets currentContext to NONE and calls next if no authorization header is present', async () => {
      mockedGetAuthHeader.mockReturnValue(undefined);

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(res.locals?.currentContext).toEqual({
        authType: AuthType.NONE,
        initiative: INITIATIVE
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('sets currentContext to BEARER, performs login, and calls next if token is valid', async () => {
      const token = 'valid.token.here';
      const payload = { sub: 'user123', exp: 9999999999, identity_provider: IdentityProviderKind.AZUREIDIR };
      const user = { userId: 'db-user-id' };

      mockedGetAuthHeader.mockReturnValue(`Bearer ${token}`);
      mockedGetBearerToken.mockReturnValue(token);

      jwtPayloadCache.set(token, payload);
      mockedLogin.mockResolvedValue(user as never);

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(res.locals?.currentContext).toEqual({
        authType: AuthType.BEARER,
        initiative: INITIATIVE,
        bearerToken: token,
        tokenPayload: payload,
        userId: user.userId
      });
      expect(mockedLogin).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('passes a 500 Problem to next if user login fails to return a userId', async () => {
      const token = 'valid.token.here';

      mockedGetAuthHeader.mockReturnValue(`Bearer ${token}`);
      mockedGetBearerToken.mockReturnValue(token);
      jwtPayloadCache.set(token, { sub: 'user123', identity_provider: IdentityProviderKind.AZUREIDIR });
      mockedLogin.mockResolvedValue(null as never);

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Problem));
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 500, detail: 'Failed to log user in' }));
    });

    it('passes a Problem directly to next if an underlying function throws a Problem', async () => {
      const expectedProblem = new Problem(401, { detail: 'Token invalid' });

      mockedGetAuthHeader.mockReturnValue('Bearer invalid');
      mockedGetBearerToken.mockImplementation(() => {
        throw expectedProblem;
      });

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expectedProblem);
    });

    it('wraps a standard Error in a generic 500 Problem, logs the real error, and passes it to next', async () => {
      mockedGetAuthHeader.mockImplementation(() => {
        throw new Error('Unexpected catastrophic failure');
      });

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Problem));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          detail: 'An unexpected internal server error occurred during authentication'
        })
      );
    });

    it('wraps a non-Error exception in a generic 500 Problem, logs the real error, and passes it to next', async () => {
      mockedGetAuthHeader.mockImplementation(() => {
        throw 'A completely unexpected string exception'; // nosonar
      });

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(next).toHaveBeenCalledWith(expect.any(Problem));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          detail: 'An unexpected internal server error occurred during authentication'
        })
      );
    });
  });

  describe('getVerifiedPayload', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
      req = { originalUrl: '/test' };
      res = { set: vi.fn() };
    });

    it('returns the cached payload directly and skips verification if token is in cache', async () => {
      const token = 'cached-token';
      const cachedPayload = { sub: 'user-123', identity_provider: IdentityProviderKind.AZUREIDIR };

      jwtPayloadCache.set(token, cachedPayload);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(cachedPayload);
      expect(mockedJwtDecode).not.toHaveBeenCalled();
      expect(mockedJwtVerify).not.toHaveBeenCalled();
    });

    it('throws a 401 Problem if the token cannot be decoded', async () => {
      const token = 'undecodable-token';
      mockedJwtDecode.mockReturnValue(null);

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({ status: 401, detail: 'Malformed authentication token' });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });

    it('throws a 401 Problem if jwt.verify throws an error', async () => {
      const token = 'invalid-signature-token';

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } } as never);
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      } as never);
      mockedJwtVerify.mockImplementation(() => {
        throw new Error('jwt expired');
      });

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({ status: 401, detail: 'Invalid or expired authentication token' });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });

    it('throws a 401 Problem if jwt.verify returns a string payload', async () => {
      const token = 'string-payload-token';

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } } as never);
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      } as never);
      mockedJwtVerify.mockReturnValue('this-is-just-a-string-not-json' as never);

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({
        status: 401,
        detail: 'Authentication token payload is not a valid JSON object'
      });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });

    it('returns the payload and caches it if verification succeeds and expiration is in the future', async () => {
      const token = 'fresh-token';
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validPayload = { sub: 'user-456', exp: futureExp };

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } } as never);
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      } as never);
      mockedJwtVerify.mockReturnValue(validPayload as never);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(validPayload);
      expect(jwtPayloadCache.has(token)).toBe(true);
      expect(jwtPayloadCache.get(token)).toEqual(validPayload);
      expect(mockedJwtVerify).toHaveBeenCalledWith(
        token,
        'public-key',
        expect.objectContaining({
          algorithms: ['RS256'],
          audience: AUDIENCE,
          issuer: AUTHORITY
        })
      );
    });

    it('returns the payload but does not cache it if expiration is in the past', async () => {
      const token = 'no-cache-token';
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const invalidPayload = { sub: 'user-789', exp: pastExp };

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } } as never);
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      } as never);
      mockedJwtVerify.mockReturnValue(invalidPayload as never);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(invalidPayload);
      expect(jwtPayloadCache.has(token)).toBe(false);
    });

    it('returns the payload but does not cache it if expiration is missing entirely', async () => {
      const token = 'no-exp-token';
      const noExpPayload = { sub: 'user-789' };

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } } as never);
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      } as never);
      mockedJwtVerify.mockReturnValue(noExpPayload as never);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(noExpPayload);
      expect(jwtPayloadCache.has(token)).toBe(false);
    });

    it('throws a 401 Problem if the token header is missing a kid (Key ID)', async () => {
      const token = 'missing-kid-token';

      mockedJwtDecode.mockReturnValue({ header: { alg: 'RS256' } } as never);

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({ status: 401, detail: 'Malformed authentication token' });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });

    it('throws a 401 Problem if jwksClient fails to find the signing key (invalid kid)', async () => {
      const token = 'unknown-kid-token';

      mockedJwtDecode.mockReturnValue({ header: { kid: 'unknown-key-id' } } as never);

      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: vi.fn().mockRejectedValue(new Error('Signing key not found'))
      } as never);

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({
        status: 401,
        detail: 'Invalid or expired authentication token'
      });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });
  });
});
