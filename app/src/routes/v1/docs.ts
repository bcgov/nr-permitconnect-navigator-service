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
  // if local path = '../../docs/v1.api-spec.yaml'
  // else path = ../../../docs/v1.api-spec.yaml
  const rawSpec = readFileSync(join(__dirname, '../../docs/v1.api-spec.yaml'), 'utf8');
  const spec = yaml.load(rawSpec) as OpenAPISpec;
  spec.servers[0].url = '/api/v1';
  // if (getConfigBoolean('keycloak.enabled')) {
  //   // eslint-disable-next-line max-len
  //   spec.components.securitySchemes.OpenID.openIdConnectUrl = `${config.get('keycloak.serverUrl')}/realms/${config.get('keycloak.realm')}/.well-known/openid-configuration`;
  // }
  return spec;
}

router.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'img-src': ['data:', 'https://cdn.redoc.ly'],
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
