import { writeFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { join } from 'node:path';

import { dump } from 'js-yaml';
import openapiTS, { astToString } from 'openapi-typescript';
import { format, resolveConfig } from 'prettier';

import type { OpenAPIObject } from 'openapi3-ts/oas30';

const HEADER = [
  '/**',
  ' * AUTO-GENERATED FILE - DO NOT EDIT',
  ' * @see app/src/docs/generateTypes.ts',
  ' *',
  ' * To update this file after changing a route or its zod schemas, run:',
  ' * `npm run docs:types`',
  ' */',
  '',
  '// openapi-typescript emits `{ [name: string]: unknown }` for response headers',
  '/* eslint-disable @typescript-eslint/consistent-indexed-object-style */'
].join('\n');

// Route files read config and create a JWKS client at import time, neither of which spec generation needs
const STUBS: Record<string, string> = {
  config: [
    'const config = { has: () => false, get: () => undefined };',
    'export default config;',
    'export const { has, get } = config;'
  ].join('\n'),
  'jwks-rsa': 'export default () => ({ getSigningKey: () => undefined });'
};

/**
 * Builds the OpenAPI spec from the route registry.
 * config and jwks-rsa resolve to inline stubs, the same way tests/unit/schemas/openapi.test.ts mocks them.
 * @returns The OpenAPI spec.
 */
async function buildSpec(): Promise<OpenAPIObject> {
  registerHooks({
    resolve: (specifier, context, nextResolve) =>
      specifier in STUBS
        ? { url: `data:text/javascript,${encodeURIComponent(STUBS[specifier])}`, shortCircuit: true }
        : nextResolve(specifier, context)
  });

  await import('#src/routes/index');
  const { getSpec } = await import('#src/docs/docs');
  return getSpec();
}

/**
 * Converts an OpenAPI spec into a prettier-formatted TypeScript declarations file for the frontend.
 * @param spec The OpenAPI spec.
 * @param prettierConfigPath File path prettier resolves its config from.
 * @returns The complete generated file contents, including the auto-generated header.
 */
export async function buildTypesOutput(spec: OpenAPIObject, prettierConfigPath: string): Promise<string> {
  const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0]);
  const prettierConfig = await resolveConfig(prettierConfigPath);
  return format(`${HEADER}\n\n${astToString(ast)}`, { ...prettierConfig, parser: 'typescript' });
}

async function main() {
  const spec = await buildSpec();

  const specOutputPath = join(process.cwd(), 'src/docs/v1.api-spec.yaml');
  const typesOutputPath = join(process.cwd(), '../frontend/src/types/api/generated.ts');

  writeFileSync(specOutputPath, dump(spec));
  writeFileSync(typesOutputPath, await buildTypesOutput(spec, typesOutputPath));
}

// Guard against running as a side effect of importing this module in tests.
if (process.env.VITEST !== 'true') {
  await main();
}
