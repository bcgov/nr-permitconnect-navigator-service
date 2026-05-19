import type { CustomHelpers } from 'joi';

import { codeTable } from './cache.ts';

import type { CodeTableName, ValidatorFunction } from './types.ts';

/**
 * A Proxy that dynamically generates runtime validation functions for code tables.
 */
export const requireValidCode = new Proxy({} as Record<CodeTableName, ValidatorFunction>, {
  get: (_target, prop: string) => {
    const tableName = prop as CodeTableName;

    // This closure is what Joi executes at runtime
    return (value: string, helpers: CustomHelpers) => {
      const validCodes = codeTable[tableName]?.codes || [];

      if (!validCodes.includes(value)) {
        return helpers.error('any.only', { valids: validCodes });
      }

      return value;
    };
  }
});
