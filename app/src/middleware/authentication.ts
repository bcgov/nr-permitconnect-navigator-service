import config from 'config';
import jwt from 'jsonwebtoken';

import { transactionWrapper } from '../db/utils/transactionWrapper.ts';
import { login } from '../services/user.ts';
import { Problem } from '../utils/index.ts';
import { AuthType, Initiative } from '../utils/enums/application.ts';

import type { NextFunction, Request, Response } from 'express';
import type { PrismaTransactionClient } from '../db/dataConnection.ts';
import type { CurrentContext } from '../types/index.ts';

// TODO: Implement a 401 for unrecognized users.

/**
 * Wraps an SPKI key with PEM header and footer
 * @param spki The PEM-encoded Simple public-key infrastructure string
 * @returns The PEM-encoded SPKI with PEM header and footer
 */
export const _spkiWrapper = (spki: string) => `-----BEGIN PUBLIC KEY-----\n${spki}\n-----END PUBLIC KEY-----`;

/**
 * Injects a currentContext object to the request if there exists valid authentication artifacts.
 * Subsequent logic should check `req.currentContext.authType` for authentication method if needed.
 * @param initiative The initiative associated with the request
 * @returns A middleware function
 * @throws {Problem} The error encountered upon failure
 */
export const currentContext = (initiative: Initiative) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorization = req.get('Authorization');
    const currentContext: CurrentContext = {
      authType: AuthType.NONE,
      initiative: initiative
    };

    if (authorization) {
      // OIDC JWT Authorization
      if (authorization.toLowerCase().startsWith('bearer ')) {
        currentContext.authType = AuthType.BEARER;

        try {
          const bearerToken = authorization.substring(7);
          let isValid: string | jwt.JwtPayload;

          if (config.has('server.oidc.authority') && config.has('server.oidc.publicKey')) {
            const publicKey: string = config.get('server.oidc.publicKey');
            const pemKey = publicKey.startsWith('-----BEGIN') ? publicKey : _spkiWrapper(publicKey);
            isValid = jwt.verify(bearerToken, pemKey, { issuer: config.get('server.oidc.authority') });
          } else {
            throw new Error(
              'OIDC environment variables `SERVER_OIDC_AUTHORITY` and `SERVER_OIDC_PUBLICKEY` must be defined'
            );
          }

          if (isValid) {
            currentContext.bearerToken = bearerToken;
            currentContext.tokenPayload = isValid as jwt.JwtPayload;
            const user = await transactionWrapper(async (tx: PrismaTransactionClient) => {
              return await login(tx, currentContext.tokenPayload!);
            });

            if (user && user.userId) currentContext.userId = user.userId;
            else throw new Error('Failed to log user in');
          } else {
            throw new Error('Invalid authorization token');
          }
        } catch (error) {
          if (error instanceof Error) {
            return next(new Problem(403, { detail: error.message, instance: req.originalUrl }));
          } else if (typeof error === 'string') {
            return next(new Problem(403, { detail: error, instance: req.originalUrl }));
          } else return next(new Problem(403, { instance: req.originalUrl }));
        }
      }
    }

    // Inject currentContext data into request
    req.currentContext = Object.freeze(currentContext);

    // Continue middleware
    next();
  };
};
