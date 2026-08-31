import { z } from 'zod';

import { codeTable } from './cache.ts';

import type { CodeTableName } from '#types';

/**
 * A Proxy that dynamically generates code-table-membership refinements.
 * Usage: requireValidCode.PermitState(z.string().max(255)) - wraps a base schema with a code-table check.
 */
export const requireValidCode = new Proxy(
  {} as Record<CodeTableName, <T extends z.ZodTypeAny>(base: T) => z.ZodEffects<T>>,
  {
    get: (_target, prop: string) => {
      const tableName = prop as CodeTableName;
      return <T extends z.ZodTypeAny>(base: T) =>
        base.refine(
          (value) => {
            const validCodes = codeTable[tableName]?.codes || [];
            return validCodes.includes(value as string);
          },
          () => ({ message: `Must be a valid ${tableName} code` })
        );
    }
  }
);
