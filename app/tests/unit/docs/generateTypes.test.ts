import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { dump } from 'js-yaml';

import '#src/routes/index';
import { getSpec } from '#src/docs/docs';
import { buildTypesOutput } from '#src/docs/generateTypes';

vi.mock('config', () => {
  const mock = { has: vi.fn(), get: vi.fn() };
  return { default: mock, ...mock };
});

vi.mock('jwks-rsa', () => ({
  default: vi.fn().mockReturnValue({
    getSigningKey: vi.fn()
  })
}));

const SPEC_PATH = join(process.cwd(), 'src/docs/v1.api-spec.yaml');
const TYPES_PATH = join(process.cwd(), '../frontend/src/types/api/generated.ts');

// Fails when a route or schema changes without regenerating - run `npm run docs:types` to fix
describe('generated OpenAPI artifacts', () => {
  it('committed spec matches the route registry', () => {
    expect(readFileSync(SPEC_PATH, 'utf8')).toBe(dump(getSpec()));
  });

  it('committed frontend types match the route registry', async () => {
    expect(readFileSync(TYPES_PATH, 'utf8')).toBe(await buildTypesOutput(getSpec(), TYPES_PATH));
  });
});
