// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';
import config from 'config';
import jwt from 'jsonwebtoken';

import { userService } from '../services';
import { AuthType, Initiative } from '../utils/enums/application';

import type { NextFunction, Request, Response } from 'express';
import type { CurrentContext } from '../types';

/**
 * @function _spkiWrapper
 * Wraps an SPKI key with PEM header and footer
 * @param {string} spki The PEM-encoded Simple public-key infrastructure string
 * @returns {string} The PEM-encoded SPKI with PEM header and footer
 */
export const _spkiWrapper = (spki: string) => `-----BEGIN PUBLIC KEY-----\n${spki}\n-----END PUBLIC KEY-----`;

/**
 * @function currentContext
 * Injects a currentContext object to the request if there exists valid authentication artifacts.
 * Subsequent logic should check `req.currentContext.authType` for authentication method if needed.
 * @param {Request} req Express request object
 * @param {Response} res Express response object
 * @param {NextFunction} next The next callback function
 * @returns {function} Express middleware function
 * @throws The error encountered upon failure
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
            const user = await userService.login(currentContext.tokenPayload);

            if (user && user.userId) currentContext.userId = user.userId;
            else throw new Error('Failed to log user in');
          } else {
            throw new Error('Invalid authorization token');
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          return next(new Problem(403, { detail: err.message, instance: req.originalUrl }));
        }
      }
    }

    // Inject currentContext data into request
    req.currentContext = Object.freeze(currentContext);

    // Continue middleware
    next();
  };
};
