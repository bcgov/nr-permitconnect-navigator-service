import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';

import { registry } from '#src/validators/openapi';

import type { OpenAPIObject } from 'openapi3-ts/oas30';

// Electrification, General, and Housing each register the same 8 sub-resource tags under their own prefix.
const projectTags = (prefix: string) => [
  { name: `${prefix} Access Request`, description: `Operations for managing ${prefix} Access Requests` },
  { name: `${prefix} Document`, description: `Operations for managing ${prefix} Documents` },
  { name: `${prefix} Enquiry`, description: `Operations for managing ${prefix} Enquiries` },
  { name: `${prefix} Note`, description: `Operations for managing ${prefix} Notes` },
  { name: `${prefix} Permit`, description: `Operations for managing ${prefix} Permits` },
  { name: `${prefix} Permit Note`, description: `Operations for ${prefix} Permit Notes` },
  { name: `${prefix} Project`, description: `Operations for managing ${prefix} Projects, Drafts, and Statistics` },
  { name: `${prefix} Roadmap`, description: `Operations for validating ${prefix} Roadmaps` }
];

const TAGS = [
  { name: 'Contact', description: 'Operations for managing Contacts' },
  ...projectTags('Electrification'),
  ...projectTags('General'),
  ...projectTags('Housing'),
  { name: 'Permit Type', description: 'Operations for permit types' },
  { name: 'Reporting', description: 'Operations for performings actions related to reporting' },
  { name: 'Source System Kind', description: 'Operations for source system kinds' },
  { name: 'User', description: 'Operations for managing users' }
];

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
 * Gets the OpenAPI specification, generated from the zod schemas registered via openapiRoute()
 * @returns The OpenAPI spec
 */
export function getSpec(): OpenAPIObject {
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: '3.0.4',
    info: {
      version: '1.0.0',
      title: 'NR PermitConnect Navigator Service (PCNS)',
      description: 'A case management application meant to serve the needs of the NRM Permitting Solutions Branch.',
      license: { name: 'Apache 2.0', url: 'https://www.apache.org/licenses/LICENSE-2.0.html' }
    },
    servers: [{ url: '/api/v1', description: 'This server' }],
    security: [{ BearerAuth: [], OpenID: [] }],
    tags: TAGS
  });
}
