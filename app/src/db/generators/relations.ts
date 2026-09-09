import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getDMMF } from '@prisma/internals';
import prettier from 'prettier';

import { getLogger } from '#src/utils/log';

const log = getLogger(module.filename);

export interface RelationInfo {
  targetModel: string;
  isList: boolean;
}

interface DmmfField {
  name: string;
  kind: string;
  type: string;
  isList: boolean;
  relationName?: string;
}

interface DmmfModel {
  name: string;
  fields: readonly DmmfField[];
}

/**
 * Builds a map of model name -> relation field name -> relation target info,
 * from a Prisma DMMF model list. Models with no relation fields are omitted entirely.
 * @param models Prisma DMMF models to inspect for relation fields.
 * @returns Map of model name to its relation fields' target model and cardinality.
 */
export function buildRelationsMap(models: readonly DmmfModel[]): Record<string, Record<string, RelationInfo>> {
  const relations: Record<string, Record<string, RelationInfo>> = {};

  for (const model of models) {
    const modelRelations: Record<string, RelationInfo> = {};
    for (const field of model.fields) {
      if (field.kind === 'object' && field.relationName) {
        modelRelations[field.name] = { targetModel: field.type, isList: field.isList };
      }
    }
    if (Object.keys(modelRelations).length > 0) {
      relations[model.name] = modelRelations;
    }
  }

  return relations;
}

async function main() {
  const schemaPath = join(process.cwd(), 'src/db/prisma/schema.prisma');
  const dmmf = await getDMMF({ datamodel: readFileSync(schemaPath, 'utf-8') });

  const relations = buildRelationsMap(dmmf.datamodel.models);

  const output =
    [
      '/**',
      ' * AUTO-GENERATED FILE - DO NOT EDIT',
      ' * @see app/src/db/generators/relations.ts',
      ' *',
      ' * Regenerated automatically by `npm run prisma:generate`',
      ' * (via the postprisma:generate hook). Do not run `prisma:relations` directly.',
      ' */',
      '',
      'export interface RelationInfo {',
      '  targetModel: string;',
      '  isList: boolean;',
      '}',
      '',
      'export const modelRelations: Record<string, Record<string, RelationInfo>> =',
      `  ${JSON.stringify(relations)};`
    ].join('\n') + '\n';

  const outputPath = join(process.cwd(), 'src/db/generators/output/relations.generated.ts');
  const prettierConfig = await prettier.resolveConfig(outputPath);
  const formatted = await prettier.format(output, { ...prettierConfig, parser: 'typescript' });

  log.info(`Writing generated relation map to ${outputPath} ...`);

  writeFileSync(outputPath, formatted);

  log.info(`Generated relations for ${Object.keys(relations).length} models`);
}

// Guard against running as a side effect of importing this module in tests.
if (process.env.VITEST !== 'true') {
  main().catch((e) => {
    log.error(e);
    process.exit(1);
  });
}
