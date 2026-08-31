import { Router } from 'express';
import helmet from 'helmet';
import { dump } from 'js-yaml';

import { getDocHTML, getSpec } from '#src/docs/docs';

import type { Request, Response } from 'express';

const router = Router();

/** OpenAPI Docs */
router.get(
  '/',
  helmet.contentSecurityPolicy({
    directives: {
      'connect-src': [
        "'self'", // eslint-disable-line quotes
        'https://raw.githubusercontent.com'
      ],
      'img-src': [
        "'self'", // eslint-disable-line quotes
        'data:',
        (_req, res): string => `'nonce-${(res as Response).locals.cspNonce}'`,
        'https://cdn.redoc.ly'
      ],
      'media-src': [
        "'self'", // eslint-disable-line quotes
        'data:',
        (_req, res): string => `'nonce-${(res as Response).locals.cspNonce}'`
      ],
      'script-src': [
        'blob:',
        "'unsafe-eval'" // eslint-disable-line quotes
      ],
      'script-src-elem': [
        'https://cdn.redoc.ly',
        "'unsafe-inline'" // eslint-disable-line quotes
      ]
    }
  }),
  (_req: Request, res: Response): void => {
    res.send(getDocHTML());
  }
);

/** OpenAPI YAML Spec */
router.get('/api-spec.yaml', (_req: Request, res: Response): void => {
  res.status(200).type('application/yaml').send(dump(getSpec()));
});

/** OpenAPI JSON Spec */
router.get('/api-spec.json', (_req: Request, res: Response): void => {
  res.status(200).json(getSpec());
});

export default router;
