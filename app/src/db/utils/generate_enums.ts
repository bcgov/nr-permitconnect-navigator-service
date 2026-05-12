import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Prisma } from '@prisma/client';

import prisma from '../dataConnection.ts';
import { getLogger } from '../../utils/log.ts';

const log = getLogger(module.filename);

function toPascalCase(name: string): string {
  return name
    .replace(/_code$/, '')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

async function main() {
  const models = Prisma.dmmf.datamodel.models;

  const excludeModels = ['draft_code']; // Add any code tables that should be excluded from enum generation here

  const codeModels = models.filter((m) => m.name.endsWith('_code') && !excludeModels.includes(m.name));

  let output = '// AUTO-GENERATED FILE - DO NOT EDIT\n';

  for (const model of codeModels) {
    const enumName = toPascalCase(model.name);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await (prisma as any)[model.name].findMany({
      select: { code: true },
      orderBy: { code: 'asc' }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const values = rows.map((r: any) => r.code);

    const entries = values
      .map((v: string) => {
        const key = v.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
        return `  ${key}: '${v}'`;
      })
      .join(',\n');

    // Check if the type definition line would exceed 120 characters
    const typeLine = `export type ${enumName} = (typeof ${enumName})[keyof typeof ${enumName}];`;
    const typeDefinition =
      typeLine.length > 120 ? `export type ${enumName} =\n  (typeof ${enumName})[keyof typeof ${enumName}];` : typeLine;

    output += [`export const ${enumName} = {`, entries, '} as const;', '', typeDefinition].join('\n') + '\n\n';
  }
  output = output.trimEnd() + '\n';

  const appOutputPath = join(process.cwd(), 'src/db/utils/codeEnums.ts');
  const frontendOutputPath = join(process.cwd(), '../frontend/src/utils/enums/codeEnums.ts');

  log.info(`Writing generated enums to ${appOutputPath} ...`);

  writeFileSync(appOutputPath, output);

  writeFileSync(frontendOutputPath, output);

  log.info(`Generated ${codeModels.length} enums`);
}

main()
  .catch((e) => {
    log.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
