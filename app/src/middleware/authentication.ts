import config from 'config';
import jwt from 'jsonwebtoken';
import { LRUCache } from 'lru-cache';

import { getAuthHeader, getBearerToken, getJwksClient, setAuthHeader } from './providers/oidc.ts';
import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { login } from '../services/user.ts';
import { AuthType, Initiative } from '../utils/enums/application.ts';
import { Problem } from '../utils/index.ts';
import { getLogger } from '../utils/log.ts';

import type { NextFunction, Request, Response } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';

const log = getLogger(module.filename);

export const jwtPayloadCache = new LRUCache<string, jwt.JwtPayload>({
  allowStale: false,
  max: 100,
  ttl: 1000 * 60 * 5
});

/**
 * Authenticates incoming request and injects the current context into request.
 * Subsequent logic should check `req.currentContext.authType` for authentication method if needed.
 * @param initiative The initiative associated with the request.
 * @returns A middleware function.
 * @throws {Problem} The error encountered upon failure.
 */
export const hasAuthentication = (initiative: Initiative) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = getAuthHeader(req, res);

      if (authHeader === undefined) {
        req.currentContext = Object.freeze({
          authType: AuthType.NONE,
          initiative
        });
      } else {
        const token = getBearerToken(authHeader, req, res);
        const payload = await getVerifiedPayload(token, req, res);
        const user = await transactionWrapper(async (tx: PrismaTransactionClient) => {
          return await login(tx, payload);
        });

        if (!user?.userId) throw new Problem(500, { detail: 'Failed to log user in', instance: req.originalUrl });

        req.currentContext = Object.freeze({
          authType: AuthType.BEARER,
          initiative,
          bearerToken: token,
          tokenPayload: payload,
          userId: user.userId
        });
      }

      next();
    } catch (error) {
      if (error instanceof Problem) return next(error);

      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Unexpected authentication error: ${errorMessage}`);

      next(
        new Problem(500, {
          detail: 'An unexpected internal server error occurred during authentication',
          instance: req.originalUrl
        })
      );
    }
  };
};

/**
 * Verifies a JWT bearer token and retrieves the verified payload, utilizing an LRU cache for performance.
 * @param token The raw JWT bearer token string to verify.
 * @param req The Express request object used for error context.
 * @param res The Express response object used to set authentication error headers.
 * @returns A promise that resolves to the verified and frozen JWT payload.
 * @throws {Problem} 401 if the token is malformed, invalid, expired, or has an invalid payload.
 */
export async function getVerifiedPayload(token: string, req: Request, res: Response): Promise<JwtPayload> {
  if (jwtPayloadCache.has(token)) return jwtPayloadCache.get(token)!;

  const audience: string = config.get('server.oidc.audience');
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    setAuthHeader(res, { realm: audience, error: 'invalid_token' });
    throw new Problem(401, { detail: 'Malformed authentication token' });
  }

  const jwksClient = await getJwksClient();

  let payload: string | jwt.JwtPayload;

  try {
    const kid = await jwksClient.getSigningKey(decoded.header.kid);

    payload = jwt.verify(token, kid.getPublicKey(), {
      algorithms: ['RS256'],
      audience: audience,
      issuer: config.get('server.oidc.authority')
    });
  } catch {
    setAuthHeader(res, { realm: audience, error: 'invalid_token' });
    throw new Problem(401, { detail: 'Invalid or expired authentication token', instance: req.originalUrl });
  }

  if (typeof payload === 'string') {
    setAuthHeader(res, { realm: audience, error: 'invalid_token' });
    throw new Problem(401, { detail: 'Authentication token payload is not a valid JSON object' });
  }

  const frozenPayload = Object.freeze(payload);

  const remainingMs = payload.exp ? (payload.exp - Math.floor(Date.now() / 1000)) * 1000 - 5000 : 0;
  if (remainingMs > 0) jwtPayloadCache.set(token, frozenPayload, { ttl: remainingMs });

  return payload;
}
