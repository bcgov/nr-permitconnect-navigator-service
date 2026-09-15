import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { generatorHandler } from '@prisma/generator-helper';
import prettier from 'prettier';

import { buildRelationsMap } from './relations.ts';
import { getLogger } from '#src/utils/log';

import type { GeneratorOptions } from '@prisma/generator-helper';

const log = getLogger(module.filename);

generatorHandler({
  onManifest: () => ({
    defaultOutput: '../generated/relations',
    prettyName: 'Relations Map Generator'
  }),
  onGenerate: async (options: GeneratorOptions) => {
    const relations = buildRelationsMap(options.dmmf.datamodel.models);

    const output =
      [
        '/**',
        ' * AUTO-GENERATED FILE - DO NOT EDIT',
        ' * @see app/src/db/generators/relationsGenerator.ts',
        ' *',
        ' * Regenerated automatically by `npm run prisma:generate`.',
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

    const outputDir = options.generator.output?.value;
    if (!outputDir) throw new Error('relations generator: no output directory configured');
    const outputPath = join(outputDir, 'relations.generated.ts');

    mkdirSync(outputDir, { recursive: true });

    const prettierConfig = await prettier.resolveConfig(outputPath);
    const formatted = await prettier.format(output, { ...prettierConfig, parser: 'typescript' });

    log.info(`Writing generated relation map to ${outputPath} ...`);
    writeFileSync(outputPath, formatted);
    log.info(`Generated relations for ${Object.keys(relations).length} models`);
  }
});
