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
        'img-src': ['data:', 'https://cdn.redoc.ly'],
        'script-src': ['blob:', 'https://cdn.redoc.ly']
      }
    }
  })
);

// router.get('/test', (_req: Request, res: Response) => {
//   const url =
//     'https://openmaps.gov.bc.ca/geo/pub/wfs?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&outputFormat=json&typeName=WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW&CQL_FILTER=INTERSECTS(SHAPE,%20POLYGON%20((1193370.672730913%20383239.8324306654,%201193348.609585723%20383168.66953196935,%201193474.1532485012%20383132.9849056583,%201193529.7406295289%20383223.5657357173,%201193370.672730913%20383239.8324306654)))';
//   axios.get(url).then(function (response) {
//     res.status(200).send(response.data);
//   });
// });

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
