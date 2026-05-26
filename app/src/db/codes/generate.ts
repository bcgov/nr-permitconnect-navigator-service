import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import prisma from '../dataConnection.ts';
import { getLogger } from '../../utils/log.ts';
import { CODE_TABLES } from './tables.ts';

import type { CodeTableDelegate } from './types.ts';

const log = getLogger(module.filename);

async function main() {
  let output =
    [
      '/**',
      ' * AUTO-GENERATED FILE - DO NOT EDIT',
      ' * @see app/src/db/codes/generate.ts',
      ' *',
      ' * To update this file when updating or adding code tables to the db, run:',
      ' * `npm run prisma:enums`',
      ' */'
    ].join('\n') + '\n\n';

  for (const { name, model } of CODE_TABLES) {
    const delegate = (prisma as unknown as Record<string, CodeTableDelegate>)[model];
    const rows = await delegate.findMany({
      where: { active: true },
      select: { code: true },
      orderBy: { code: 'asc' }
    });

    const entries = rows
      .map((r: { code: string }) => {
        const key = r.code.replace(/\W/g, '_').toUpperCase();
        return `  ${key}: '${r.code}'`;
      })
      .join(',\n');

    // Check if the type definition line would exceed 120 characters
    const typeLine = `export type ${name} = (typeof ${name})[keyof typeof ${name}];`;
    const typeDefinition =
      typeLine.length > 120 ? `export type ${name} =\n  (typeof ${name})[keyof typeof ${name}];` : typeLine;

    output += [`export const ${name} = {`, entries, '} as const;', '', typeDefinition].join('\n') + '\n\n';
  }
  output = output.trimEnd() + '\n';

  const appOutputPath = join(process.cwd(), 'src/db/codes/enums.ts');
  const frontendOutputPath = join(process.cwd(), '../frontend/src/utils/enums/codeEnums.ts');

  log.info(`Writing generated enums to ${appOutputPath} ...`);

  writeFileSync(appOutputPath, output);

  writeFileSync(frontendOutputPath, output);

  log.info(`Generated ${CODE_TABLES.length} enums`);
}

main()
  .catch((e) => {
    log.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
