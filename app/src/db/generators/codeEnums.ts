import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { CODE_TABLES } from '#src/db/codes/tables';
import prisma from '#src/db/database';
import { getLogger } from '#src/utils/log';

import type { CodeTableDelegate } from '#types';

const log = getLogger(module.filename);

interface CodeRow {
  code: string;
}

interface CodeTableEntry {
  name: string;
  rows: CodeRow[];
}

/**
 * Formats a single code table's `const` object and matching union type declaration.
 * @param name PascalCase logical name used in application code.
 * @param rows Active code rows for this table, in display order.
 * @returns The `export const`/`export type` block for this table (no trailing blank line).
 */
export function formatEnumBlock(name: string, rows: CodeRow[]): string {
  const entries = rows
    .map((r) => {
      const key = r.code.replace(/\W/g, '_').toUpperCase();
      return `  ${key}: '${r.code}'`;
    })
    .join(',\n');

  // Check if the type definition line would exceed 120 characters
  const typeLine = `export type ${name} = (typeof ${name})[keyof typeof ${name}];`;
  const typeDefinition =
    typeLine.length > 120 ? `export type ${name} =\n  (typeof ${name})[keyof typeof ${name}];` : typeLine;

  return [`export const ${name} = {`, entries, '} as const;', '', typeDefinition].join('\n');
}

/**
 * Builds the full generated-enums file contents from a list of code table entries.
 * @param entries Code table name/rows pairs, in output order.
 * @returns The complete generated file contents, including the auto-generated header.
 */
export function buildEnumsOutput(entries: CodeTableEntry[]): string {
  let output =
    [
      '/**',
      ' * AUTO-GENERATED FILE - DO NOT EDIT',
      ' * @see app/src/db/generators/codeEnums.ts',
      ' *',
      ' * To update this file when updating or adding code tables to the db, run:',
      ' * `npm run prisma:enums`',
      ' */'
    ].join('\n') + '\n\n';

  for (const { name, rows } of entries) {
    output += formatEnumBlock(name, rows) + '\n\n';
  }

  return output.trimEnd() + '\n';
}

async function main() {
  const entries: CodeTableEntry[] = [];
  for (const { name, model } of CODE_TABLES) {
    const delegate = (prisma as unknown as Record<string, CodeTableDelegate>)[model];
    const rows = await delegate.findMany({
      where: { active: true },
      select: { code: true },
      orderBy: { code: 'asc' }
    });
    entries.push({ name, rows });
  }

  const output = buildEnumsOutput(entries);

  const appOutputPath = join(process.cwd(), 'src/db/codes/enums.ts');
  const frontendOutputPath = join(process.cwd(), '../frontend/src/utils/enums/codeEnums.ts');

  log.info(`Writing generated enums to ${appOutputPath} ...`);

  writeFileSync(appOutputPath, output);

  writeFileSync(frontendOutputPath, output);

  log.info(`Generated ${CODE_TABLES.length} enums`);
}

// Guard against running as a side effect of importing this module in tests.
if (process.env.VITEST !== 'true') {
  main()
    .catch((e) => {
      log.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
