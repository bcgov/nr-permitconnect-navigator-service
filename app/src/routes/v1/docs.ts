import { Router } from 'express';
import { readFileSync } from 'fs';
import helmet from 'helmet';
import yaml from 'js-yaml';
import { join } from 'path';

import docs from '../../docs/docs.ts';

import type { Request, Response } from 'express';

const router = Router();

interface OpenAPISpec {
  servers: { url: string }[];
  components: {
    securitySchemes: {
      OpenID: {
        openIdConnectUrl?: string;
      };
    };
  };
}

/**
 * Gets the OpenAPI specification
 * @returns The OpenAPI spec
 */
function getSpec(): OpenAPISpec | undefined {
  const rawSpec = readFileSync(join(__dirname, '../../docs/v1.api-spec.yaml'), 'utf8');
  const spec = yaml.load(rawSpec) as OpenAPISpec;
  spec.servers[0].url = '/api/v1';
  return spec;
}

/** OpenAPI Docs */
router.get(
  '/',
  helmet({
    contentSecurityPolicy: {
      directives: {
        'connect-src': [
          "'self'", // eslint-disable-line quotes
          'https://raw.githubusercontent.com'
        ],
        // @ts-expect-error ts(2322)
        'img-src': [
          "'self'", // eslint-disable-line quotes
          'data:',
          (_req: Request, res: Response): string => `'nonce-${res.locals.cspNonce}'`,
          'https://cdn.redoc.ly'
        ],
        // @ts-expect-error ts(2322)
        'media-src': [
          "'self'", // eslint-disable-line quotes
          'data:',
          (_req: Request, res: Response): string => `'nonce-${res.locals.cspNonce}'`
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
    }
  }),
  (_req: Request, res: Response): void => {
    res.send(docs.getDocHTML('v1'));
  }
);

/** OpenAPI YAML Spec */
router.get('/api-spec.yaml', (_req: Request, res: Response) => {
  res.status(200).type('application/yaml').send(yaml.dump(getSpec()));
});

/** OpenAPI JSON Spec */
router.get('/api-spec.json', (_req: Request, res: Response) => {
  res.status(200).json(getSpec());
});

export default router;
