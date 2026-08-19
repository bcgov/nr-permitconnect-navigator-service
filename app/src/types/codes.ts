import { listCodeTablesService } from '#src/services/code';

import type { CustomHelpers, ErrorReport } from 'joi';
import type * as codeEnums from '#src/db/codes/enums';

export type CodeTableName = keyof typeof codeEnums;

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

export type CodeTablesResult = Awaited<ReturnType<typeof listCodeTablesService>>;

export type CodeCache = Readonly<Record<CodeTableName, CachedCodeTable>>;

export type ValidatorFunction = (value: string, helpers: CustomHelpers) => string | ErrorReport;
