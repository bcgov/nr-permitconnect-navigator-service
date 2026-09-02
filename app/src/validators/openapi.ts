import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Must run before any schema in validators/*.ts calls .openapi() - side effect import only.
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  description: 'Bearer token auth using an OIDC issued JWT token',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});
registry.registerComponent('securitySchemes', 'OpenID', {
  type: 'openIdConnect',
  description: 'OpenID Connect endpoint for acquiring JWT tokens',
  openIdConnectUrl: 'https://logonproxy.gov.bc.ca/auth/realms/your-realm-name/.well-known/openid-configuration'
});
