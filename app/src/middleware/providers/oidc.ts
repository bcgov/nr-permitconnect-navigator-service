import config from 'config';
import jwksRsa from 'jwks-rsa';

import { Problem } from '../../utils/index.ts';
import { getLogger } from '../../utils/log.ts';

import type { Request, Response } from 'express';
import type { JwksClient } from 'jwks-rsa';

const log = getLogger(module.filename);

let jwksClientPromise: Promise<JwksClient> | null = null;
let jwksUriPromise: Promise<string> | null = null;

/**
 * Represents an error that occurred during authentication.
 * @see https://datatracker.ietf.org/doc/html/rfc6750#section-3
 */
export interface AuthErrorAttributes {
  /** The realm associated with the error. */
  realm: string;

  /** The type of authentication error that occurred. */
  error?: AuthErrorCodes;

  /** A description of the error, if provided. */
  error_description?: string;
}

/**
 * Defines the possible error codes for authentication errors.
 * @see https://datatracker.ietf.org/doc/html/rfc6750#section-3.1
 */
export type AuthErrorCodes = 'invalid_request' | 'invalid_token' | 'insufficient_scope';

/**
 * Gets the Authenticate header from the Express request object and checks for single authorization method use.
 * @see https://datatracker.ietf.org/doc/html/rfc6750#section-3.1
 * @param req The Express request object.
 * @param res The Express response object.
 * @throws {Problem} 400 `invalid_request` if the wrong auth method is used.
 * @returns The request authorization header string or undefined if no authorization header.
 */
export function getAuthHeader(req: Request, res: Response): string | undefined {
  const authHeader = req.headers.authorization;
  const hasBodyAuth = req.headers['content-type'] === 'application/x-www-form-urlencoded' || !!req.body?.access_token;
  const hasQueryAuth = !!req.query.access_token;

  // Note: If additional auth methods are enabled, add logic to ensure only one is used at a time.
  if (hasBodyAuth || hasQueryAuth) {
    const audience: string = config.get('server.oidc.audience');

    setAuthHeader(res, { realm: audience });
    throw new Problem(401, { detail: 'Unsupported authentication method', instance: req.originalUrl });
  }

  return authHeader;
}

/**
 * Extracts a valid bearer token from the authorization header string.
 * @see https://datatracker.ietf.org/doc/html/rfc6750#section-2.1
 * @param authHeader The authorization header string.
 * @param req The Express request object.
 * @param res The Express response object.
 * @throws {Problem} 401 if token is malformed or invalid.
 * @returns The valid bearer token as a string.
 */
export function getBearerToken(authHeader: string, req: Request, res: Response): string {
  const parts = authHeader.trim().split(/\s+/);
  const [scheme, token] = parts;
  const isValid = scheme === 'Bearer' && parts.length === 2;
  const isWellFormed = token && /^[A-Za-z0-9\-._~+/]+=*$/.test(token); // RFC 6750 Section 2.1

  if (isValid && isWellFormed) return token;

  const audience: string = config.get('server.oidc.audience');

  setAuthHeader(res, { realm: audience, error: 'invalid_token' });
  throw new Problem(401, { detail: 'Invalid authentication token', instance: req.originalUrl });
}

/**
 * Yields an instance of the JWKS client using the provided configuration
 * @returns An instance of the JWKS client
 * @throws {Error | TypeError} If the underlying OIDC configuration fetch fails or is invalid.
 */
export async function getJwksClient(): Promise<JwksClient> {
  if (jwksClientPromise !== null) {
    log.debug('Fetching JWKS Client (cached)');
    return jwksClientPromise;
  }

  // Promise lock to prevent multiple concurrent lookups.
  jwksClientPromise = (async () => {
    try {
      log.debug('Fetching JWKS Client');
      return jwksRsa({
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 600000, // 10 minutes
        jwksRequestsPerMinute: 10,
        jwksUri: await getJwksUri(),
        rateLimit: true,
        timeout: 30000 // 30 seconds
      });
    } catch (error) {
      jwksClientPromise = null;
      throw error;
    }
  })();

  return jwksClientPromise;
}

/**
 * Yields the JWKS URI from an OpenID Provider's configuration information.
 * @see https://openid.net/specs/openid-connect-discovery-1_0.html#ProviderConfig
 * @returns The jwks_uri string from the configuration
 * @throws {Error} If the OIDC authority is not set or the network fetch fails.
 * @throws {TypeError} If `jwks_uri` is missing or invalid in the configuration payload.
 */
export async function getJwksUri(): Promise<string> {
  if (jwksUriPromise !== null) {
    log.debug('Fetching JWKS URI (cached)');
    return jwksUriPromise;
  }

  // Promise lock to prevent multiple concurrent lookups.
  jwksUriPromise = (async () => {
    try {
      log.debug('Fetching JWKS URI');
      const issuer: string = config.get('server.oidc.authority');
      if (!issuer) throw new Error('OIDC authority is not set');

      const configurationUrl = new URL(
        '.well-known/openid-configuration',
        issuer.endsWith('/') ? issuer : `${issuer}/`
      ).toString();
      const res = await fetch(configurationUrl);
      if (!res.ok) throw new Error(`Failed to load OIDC Provider configuration: ${res.status} ${res.statusText}`);

      const configuration = (await res.json()) as { jwks_uri?: string };
      if (typeof configuration.jwks_uri !== 'string') {
        throw new TypeError('`jwks_uri` missing or invalid in OIDC Provider configuration');
      }

      return configuration.jwks_uri;
    } catch (error) {
      jwksUriPromise = null;
      throw error;
    }
  })();

  return jwksUriPromise;
}

/**
 * Sets the WWW-Authenticate header in the response to provide authentication error details.
 * @see https://datatracker.ietf.org/doc/html/rfc6750#section-3
 * @see https://datatracker.ietf.org/doc/html/rfc7230#section-3.2.4
 * @param res The Express response object.
 * @param attributes - An object containing key-value pairs for the authentication error details.
 * @returns The modified response object with the set WWW-Authenticate header.
 */
export function setAuthHeader(res: Response, attributes: AuthErrorAttributes): Response {
  const headerValue = `Bearer ${Object.entries(attributes)
    // Drop undefined pairs and non-US-ASCII encoded values (RFC 7230 Section 3.2.4)
    .filter(([k, v]) => k && v && /^[\u0020-\u007E]*$/.test(v as string))
    // Escape double quotes and backslashes in values
    .map(([k, v]) => {
      const value = (v as string).replaceAll('\\', String.raw`\\`).replaceAll('"', String.raw`\"`);
      return `${k}="${value}"`;
    })
    .join(', ')}`;
  return res.set('WWW-Authenticate', headerValue);
}
