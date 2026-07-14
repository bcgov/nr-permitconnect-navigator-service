import { load } from 'js-yaml';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** A partial OpenAPI specification schema structure */
interface OpenAPISpec {
  security?: [];
  servers: { url: string }[];
  components: {
    securitySchemes?: {
      OpenID: {
        openIdConnectUrl?: string;
      };
    };
  };
}

/**
 * Generates a ReDocs HTML string for the documentation page of the NR
 * Permitting Exchange, Aggregation and Collection Hub (PEACH) API.
 * @param version - The version of the API documentation to display. Defaults to 'v1'.
 * @returns The HTML string for the documentation page.
 */
export function getDocHTML(version = 'v1'): string {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>NR PermitConnect Navigator Service (PCNS) API - Documentation ${version}</title>
      <!-- Needed for adaptive design -->
      <meta charset="utf-8"/>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

      <!-- ReDoc doesn't change outer page styles -->
      <style>
        body { margin: 0; padding: 0; }
      </style>
    </head>
    <body>
      <redoc spec-url='/api/${version}/docs/api-spec.yaml' />
      <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    </body>
  </html>`;
}

/**
 * Gets the OpenAPI specification
 * @returns The OpenAPI spec
 */
export function getSpec(): OpenAPISpec | undefined {
  const rawSpec = readFileSync(join(__dirname, '../../docs/v1.api-spec.yaml'), 'utf8');
  const spec = load(rawSpec) as OpenAPISpec;
  spec.servers[0].url = '/api/v1';
  return spec;
}
