import jwt from 'jsonwebtoken';

import { transactionWrapper } from '../../../src/db/utils/transactionWrapper';
import { getVerifiedPayload, hasAuthentication, jwtPayloadCache } from '../../../src/middleware/authentication';
import * as oidcProviders from '../../../src/middleware/providers/oidc';
import { login } from '../../../src/services/user';
import { Problem } from '../../../src/utils/index';
import { AuthType, IdentityProviderKind, Initiative } from '../../../src/utils/enums/application';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../../../src/db/dataConnection';

const AUDIENCE = 'nr-permitting-connect-test';
const AUTHORITY = 'https://auth.example.com';
const INITIATIVE = Initiative.PCNS;

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'server.oidc.audience') return AUDIENCE;
    if (key === 'server.oidc.authority') return AUTHORITY;
    else return '';
  })
}));

jest.mock('jsonwebtoken', () => ({
  decode: jest.fn(),
  verify: jest.fn()
}));

jest.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ error: jest.fn() })
}));

jest.mock('../../../src/middleware/providers/oidc', () => ({
  getAuthHeader: jest.fn(),
  getBearerToken: jest.fn(),
  getJwksClient: jest.fn(),
  setAuthHeader: jest.fn()
}));

jest.mock('../../../src/db/utils/transactionWrapper', () => ({
  transactionWrapper: jest.fn((cb) => cb({} as PrismaTransactionClient))
}));

jest.mock('../../../src/services/user', () => ({
  login: jest.fn()
}));

describe('authentication middleware', () => {
  const mockedJwtDecode = jwt.decode as jest.Mock;
  const mockedJwtVerify = jwt.verify as jest.Mock;
  const mockedGetAuthHeader = oidcProviders.getAuthHeader as jest.Mock;
  const mockedGetBearerToken = oidcProviders.getBearerToken as jest.Mock;
  const mockedGetJwksClient = oidcProviders.getJwksClient as jest.Mock;
  const mockedSetAuthHeader = oidcProviders.setAuthHeader as jest.Mock;
  const mockedLogin = login as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jwtPayloadCache.clear();
  });

  describe('hasAuthentication', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
      req = { originalUrl: '/test' };
      res = {};
      next = jest.fn();
    });

    it('sets currentContext to NONE and calls next if no authorization header is present', async () => {
      mockedGetAuthHeader.mockReturnValue(undefined);

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(req.currentContext).toEqual({
        authType: AuthType.NONE,
        initiative: INITIATIVE
      });
      expect(next).toHaveBeenCalledWith();
    });

    it('sets currentContext to BEARER, performs login, and calls next if token is valid', async () => {
      const token = 'valid.token.here';
      const payload = { sub: 'user123', exp: 9999999999, identity_provider: IdentityProviderKind.IDIR };
      const user = { userId: 'db-user-id' };

      mockedGetAuthHeader.mockReturnValue(`Bearer ${token}`);
      mockedGetBearerToken.mockReturnValue(token);

      jwtPayloadCache.set(token, payload);
      mockedLogin.mockResolvedValue(user);

      const middleware = hasAuthentication(INITIATIVE);
      await middleware(req as Request, res as Response, next);

      expect(req.currentContext).toEqual({
        authType: AuthType.BEARER,
        initiative: INITIATIVE,
        bearerToken: token,
        tokenPayload: payload,
        userId: user.userId
      });
      expect(transactionWrapper).toHaveBeenCalledTimes(1);
      expect(mockedLogin).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalledWith();
    });

    it('passes a 500 Problem to next if user login fails to return a userId', async () => {
      const token = 'valid.token.here';

      mockedGetAuthHeader.mockReturnValue(`Bearer ${token}`);
      mockedGetBearerToken.mockReturnValue(token);
      jwtPayloadCache.set(token, { sub: 'user123', identity_provider: IdentityProviderKind.IDIR });
      mockedLogin.mockResolvedValue(null);

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
      res = { set: jest.fn() };
    });

    it('returns the cached payload directly and skips verification if token is in cache', async () => {
      const token = 'cached-token';
      const cachedPayload = { sub: 'user-123', identity_provider: IdentityProviderKind.IDIR };

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

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } });
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      });
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

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } });
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      });
      mockedJwtVerify.mockReturnValue('this-is-just-a-string-not-json');

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

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } });
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      });
      mockedJwtVerify.mockReturnValue(validPayload);

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

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } });
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      });
      mockedJwtVerify.mockReturnValue(invalidPayload);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(invalidPayload);
      expect(jwtPayloadCache.has(token)).toBe(false);
    });

    it('returns the payload but does not cache it if expiration is missing entirely', async () => {
      const token = 'no-exp-token';
      const noExpPayload = { sub: 'user-789' };

      mockedJwtDecode.mockReturnValue({ header: { kid: 'key-id' } });
      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockResolvedValue({ getPublicKey: () => 'public-key' })
      });
      mockedJwtVerify.mockReturnValue(noExpPayload);

      const result = await getVerifiedPayload(token, req as Request, res as Response);

      expect(result).toEqual(noExpPayload);
      expect(jwtPayloadCache.has(token)).toBe(false);
    });

    it('throws a 401 Problem if the token header is missing a kid (Key ID)', async () => {
      const token = 'missing-kid-token';

      mockedJwtDecode.mockReturnValue({ header: { alg: 'RS256' } });

      const action = getVerifiedPayload(token, req as Request, res as Response);

      await expect(action).rejects.toThrow(Problem);
      await expect(action).rejects.toMatchObject({ status: 401, detail: 'Malformed authentication token' });
      expect(mockedSetAuthHeader).toHaveBeenCalledWith(res, { realm: AUDIENCE, error: 'invalid_token' });
    });

    it('throws a 401 Problem if jwksClient fails to find the signing key (invalid kid)', async () => {
      const token = 'unknown-kid-token';

      mockedJwtDecode.mockReturnValue({ header: { kid: 'unknown-key-id' } });

      mockedGetJwksClient.mockResolvedValue({
        getSigningKey: jest.fn().mockRejectedValue(new Error('Signing key not found'))
      });

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
