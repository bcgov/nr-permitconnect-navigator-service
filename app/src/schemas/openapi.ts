import { extendZodWithOpenApi, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import config from 'config';
import { z } from 'zod';

// Must run before any schema calls .openapi() - side effect import only.
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

registry.registerComponent('securitySchemes', 'BearerAuth', {
  type: 'http',
  description: 'Bearer token auth using an OIDC issued JWT token',
  scheme: 'bearer',
  bearerFormat: 'JWT'
});

// Same authority/discovery URL construction as getJwksUri() - see src/middleware/providers/oidc.ts.
// Falls back to '' when unset (e.g. in tests, which never generate a real spec) rather than
// crashing every schema file's import chain at load time.
const oidcAuthority: string | undefined = config.has('server.oidc.authority')
  ? config.get('server.oidc.authority')
  : undefined;
const openIdConnectUrl = oidcAuthority
  ? new URL(
      '.well-known/openid-configuration',
      oidcAuthority.endsWith('/') ? oidcAuthority : `${oidcAuthority}/`
    ).toString()
  : '';

registry.registerComponent('securitySchemes', 'OpenID', {
  type: 'openIdConnect',
  description: 'OpenID Connect endpoint for acquiring JWT tokens',
  openIdConnectUrl
});
