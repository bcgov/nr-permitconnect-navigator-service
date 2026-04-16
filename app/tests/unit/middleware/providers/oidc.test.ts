import config from 'config';

import { getAuthHeader, getBearerToken, setAuthHeader } from '../../../../src/middleware/providers/oidc';
import { Problem } from '../../../../src/utils/index';

import type { Request, Response } from 'express';
import type { JwksClient } from 'jwks-rsa';
import type { AuthErrorAttributes } from '../../../../src/middleware/providers/oidc';

const AUDIENCE = 'nr-permitting-connect-test';

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'server.oidc.audience') return 'nr-permitting-connect-test';
    else return '';
  })
}));

jest.mock('jwks-rsa', () => {
  return jest.fn().mockReturnValue({
    getSigningKey: jest.fn()
  });
});

jest.mock('../../../../src/utils/log', () => ({
  getLogger: () => ({ debug: jest.fn() })
}));

describe('oidc providers', () => {
  let mockedConfigGet = config.get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAuthHeader', () => {
    let res: Response;

    beforeEach(() => {
      res = { set: jest.fn() } as unknown as Response;
    });

    it('returns the authorization header if it is the only method used', () => {
      const req = {
        headers: { authorization: 'Bearer token' },
        query: {},
        body: {}
      } as unknown as Request;

      const result = getAuthHeader(req, res);

      expect(result).toBe('Bearer token');
    });

    it('returns undefined if no authentication method is present', () => {
      const req = {
        headers: {},
        query: {},
        body: {}
      } as unknown as Request;

      const result = getAuthHeader(req, res);

      expect(result).toBeUndefined();
    });

    it('throws a 401 Problem if unsupported query authentication is used', () => {
      const req = {
        headers: {},
        query: { access_token: 'token' },
        body: {}
      } as unknown as Request;

      const action = () => getAuthHeader(req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Unsupported authentication method'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining(`Bearer realm="${AUDIENCE}"`));
    });

    it('throws a 401 Problem if unsupported body authentication is used', () => {
      const req = {
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        query: {},
        body: { access_token: 'token' }
      } as unknown as Request;

      const action = () => getAuthHeader(req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Unsupported authentication method'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining(`Bearer realm="${AUDIENCE}"`));
    });

    it('does not crash if req.body is undefined', () => {
      const req = {
        headers: { authorization: 'Bearer token' },
        query: {}
      } as unknown as Request;

      const result = getAuthHeader(req, res);

      expect(result).toBe('Bearer token');
    });
  });

  describe('getBearerToken', () => {
    let res: Response;

    beforeEach(() => {
      res = { set: jest.fn() } as unknown as Response;
    });

    it('extracts the Bearer token from the authorization header string', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const result = getBearerToken('Bearer token123', req, res);

      expect(result).toBe('token123');
    });

    it('throws a 401 Problem if the scheme is not Bearer', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const action = () => getBearerToken('Basic token123', req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Invalid authentication token'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('error="invalid_token"'));
    });

    it('throws a 401 Problem if there are too many parts in the header', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const action = () => getBearerToken('Bearer token123 extra', req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Invalid authentication token'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('error="invalid_token"'));
    });

    it('throws a 401 Problem if there are too few parts in the header', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const action = () => getBearerToken('Bearer', req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Invalid authentication token'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('error="invalid_token"'));
    });

    it('throws a 401 Problem if the token format is malformed (invalid characters)', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const action = () => getBearerToken('Bearer invalid_token!', req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Invalid authentication token'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('error="invalid_token"'));
    });

    it('throws a 401 Problem if the header is empty or only whitespace', () => {
      const req = { originalUrl: '/test' } as unknown as Request;
      const action = () => getBearerToken('   ', req, res);

      expect(action).toThrow(Problem);
      expect(action).toThrow(
        expect.objectContaining({
          status: 401,
          detail: 'Invalid authentication token'
        })
      );
      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', expect.stringContaining('error="invalid_token"'));
    });
  });

  describe('getJwksClient', () => {
    let getJwksClient: () => Promise<JwksClient>;

    beforeEach(async () => {
      jest.resetModules();

      const configModule = await import('config');
      const config = configModule.default || configModule;
      mockedConfigGet = config.get as jest.Mock;

      getJwksClient = (await import('../../../../src/middleware/providers/oidc.ts')).getJwksClient;
    });

    it('creates a JWKS client and caches the promise', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com/');

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ jwks_uri: 'https://auth.example.com/.well-known/jwks.json' })
      });

      const client1 = await getJwksClient();
      const client2 = await getJwksClient();

      expect(client1).toBeDefined();
      expect(client1).toBe(client2);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('clears the cache if getJwksUri fails, allowing subsequent retries', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getJwksClient()).rejects.toThrow('Failed to load OIDC Provider configuration');

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ jwks_uri: 'https://auth.example.com/.well-known/jwks.json' })
      });

      const client = await getJwksClient();

      expect(client).toBeDefined();
      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getJwksUri', () => {
    let getJwksClient: () => Promise<JwksClient>;
    let getJwksUri: () => Promise<string>;

    beforeEach(async () => {
      jest.resetModules();

      const configModule = await import('config');
      const config = configModule.default || configModule;
      mockedConfigGet = config.get as jest.Mock;

      getJwksClient = (await import('../../../../src/middleware/providers/oidc.ts')).getJwksClient;
      getJwksUri = (await import('../../../../src/middleware/providers/oidc.ts')).getJwksUri;
    });

    it('fetches the jwks_uri from the OIDC Provider configuration', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ jwks_uri: 'https://auth.example.com/.well-known/jwks.json' })
      });

      const result = await getJwksUri();

      expect(result).toBe('https://auth.example.com/.well-known/jwks.json');
      expect(globalThis.fetch).toHaveBeenCalledWith('https://auth.example.com/.well-known/openid-configuration');
    });

    it('returns the cached promise on subsequent calls', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ jwks_uri: 'https://auth.example.com/jwks.json' })
      });

      const result1 = await getJwksUri();
      const result2 = await getJwksUri();

      expect(result1).toBe('https://auth.example.com/jwks.json');
      expect(result2).toBe(result1);
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    it('handles issuer URL with trailing slash', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com/');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ jwks_uri: 'https://auth.example.com/.well-known/jwks.json' })
      });

      const result = await getJwksUri();

      expect(result).toBe('https://auth.example.com/.well-known/jwks.json');
      expect(globalThis.fetch).toHaveBeenCalledWith('https://auth.example.com/.well-known/openid-configuration');
    });

    it('throws an error when OIDC authority is not set', async () => {
      mockedConfigGet.mockReturnValue(undefined);

      await expect(getJwksUri()).rejects.toThrow('OIDC authority is not set');
    });

    it('throws an error when fetch fails', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(getJwksUri()).rejects.toThrow('Failed to load OIDC Provider configuration: 404 Not Found');
    });

    it('throws an error when jwks_uri is missing in the configuration', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({})
      });

      await expect(getJwksUri()).rejects.toThrow('`jwks_uri` missing or invalid in OIDC Provider configuration');
    });

    it('throws an error if getJwksUri fails', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getJwksClient()).rejects.toThrow('Failed to load OIDC Provider configuration');
    });

    it('clears the cache on failure allowing subsequent calls to retry the network', async () => {
      mockedConfigGet.mockReturnValue('https://auth.example.com');

      globalThis.fetch = jest.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getJwksUri()).rejects.toThrow(
        'Failed to load OIDC Provider configuration: 500 Internal Server Error'
      );

      (globalThis.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValueOnce({ jwks_uri: 'https://auth.example.com/.well-known/jwks.json' })
      });

      const result = await getJwksUri();
      expect(result).toBe('https://auth.example.com/.well-known/jwks.json');

      expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('setAuthHeader', () => {
    let res: Response;

    beforeEach(() => {
      res = { set: jest.fn() } as unknown as Response;
    });

    it('sets the WWW-Authenticate header with the provided attributes', () => {
      const attributes: AuthErrorAttributes = {
        realm: AUDIENCE,
        error: 'invalid_token',
        error_description: 'The access token is invalid'
      };

      setAuthHeader(res, attributes);

      expect(res.set).toHaveBeenCalledWith(
        'WWW-Authenticate',
        `Bearer realm="${AUDIENCE}", error="invalid_token", error_description="The access token is invalid"`
      );
    });

    it('sets the WWW-Authenticate header without empty attributes', () => {
      const attributes: AuthErrorAttributes = {
        realm: AUDIENCE,
        error: 'invalid_token',
        error_description: ''
      };

      setAuthHeader(res, attributes);

      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', `Bearer realm="${AUDIENCE}", error="invalid_token"`);
    });

    it('sets the WWW-Authenticate header with only US-ASCII encoded string values', () => {
      const attributes: AuthErrorAttributes = {
        realm: AUDIENCE,
        error: 'invalid_token',
        error_description: 'Non-US-ASCII characters like éñüøß exist'
      };

      setAuthHeader(res, attributes);

      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', `Bearer realm="${AUDIENCE}", error="invalid_token"`);
    });

    it('sets the WWW-Authenticate header with proper string escaping', () => {
      const attributes: AuthErrorAttributes = {
        realm: AUDIENCE,
        error: 'invalid_token',
        error_description: String.raw`Quote " and backslash \ are escaped`
      };

      setAuthHeader(res, attributes);

      expect(res.set).toHaveBeenCalledWith(
        'WWW-Authenticate',
        // eslint-disable-next-line max-len
        String.raw`Bearer realm="${AUDIENCE}", error="invalid_token", error_description="Quote \" and backslash \\ are escaped"`
      );
    });

    it('safely ignores explicitly undefined attributes without throwing', () => {
      const attributes: AuthErrorAttributes = {
        realm: AUDIENCE,
        error: undefined,
        error_description: undefined
      };

      setAuthHeader(res, attributes);

      expect(res.set).toHaveBeenCalledWith('WWW-Authenticate', `Bearer realm="${AUDIENCE}"`);
    });
  });
});
