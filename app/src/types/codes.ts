import { CustomHelpers, ErrorReport } from 'joi';

import { listAllCodeTables } from '../services/code.ts';

import type * as codeEnums from '../db/codes/enums.ts';

export interface CodeRow {
  code: string;
  display: string;
  definition: string | null;
  active: boolean;
}

export interface CodeTableDelegate {
  findMany(args: {
    where: { active: boolean };
    select: { code: boolean };
    orderBy: { code: 'asc' | 'desc' };
  }): Promise<{ code: string }[]>;
}

export type CachedCodeTable = Readonly<{
  codes: readonly string[];
  displays: Readonly<Record<string, string>>;
  definitions: Readonly<Record<string, string>>;
}>;

export type CodeTableName = keyof typeof codeEnums;

export type CodeTablesResult = Awaited<ReturnType<typeof listAllCodeTables>>;

export type CodeCache = Readonly<Record<CodeTableName, CachedCodeTable>>;

export type ValidatorFunction = (value: string, helpers: CustomHelpers) => string | ErrorReport;
