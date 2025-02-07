import { Router, Request, Response } from 'express';
import { readFileSync } from 'fs';
import helmet from 'helmet';
import yaml from 'js-yaml';
import { join } from 'path';
import docs from '../../docs/docs';

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

/** Gets the OpenAPI specification */
function getSpec(): OpenAPISpec | undefined {
  const rawSpec = readFileSync(join(__dirname, '../../docs/v1.api-spec.yaml'), 'utf8');
  const spec = yaml.load(rawSpec) as OpenAPISpec;
  spec.servers[0].url = '/api/v1';
  return spec;
}

router.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ["'self'", 'data:', (_req, res: any) => `'nonce-${res.locals.cspNonce}'`, 'https://cdn.redoc.ly'], // eslint-disable-line
        'media-src': ["'self'", 'data:', (_req, res: any) => `'nonce-${res.locals.cspNonce}'`], // eslint-disable-line
        'script-src': ['blob:', 'https://cdn.redoc.ly']
      }
    }
  })
);

/** OpenAPI Docs */
router.get('/', (_req: Request, res: Response) => {
  res.send(docs.getDocHTML('v1'));
});

/** OpenAPI YAML Spec */
router.get('/api-spec.yaml', (_req: Request, res: Response) => {
  res.status(200).type('application/yaml').send(yaml.dump(getSpec()));
});

/** OpenAPI JSON Spec */
router.get('/api-spec.json', (_req: Request, res: Response) => {
  res.status(200).json(getSpec());
});

export default router;
