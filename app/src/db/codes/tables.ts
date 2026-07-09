import { Prisma } from '@prisma/client';

import { toPascalCase } from '../../utils';

/**
 * Set of Prisma model names that should be excluded from the automatic
 * code table registry.
 *
 * Code tables are generally identified by the `_code` suffix (e.g. `permit_stage_code`),
 * but some models may match this pattern without actually functioning as code tables.
 *
 * Adding a model name here prevents it from being included in `CODE_TABLES`.
 */
const NOT_CODE_TABLES = new Set(['draft_code']);

/**
 * Registry of code table models derived from Prisma schema metadata (DMMF).
 *
 * This is dynamically generated at runtime by inspecting Prisma models and
 * selecting those whose names end with `_code`, excluding any explicitly
 * listed in `NOT_CODE_TABLES`.
 *
 * Each entry maps:
 * - `name`: PascalCase logical name used in application code
 * - `model`: original Prisma model name used for querying
 *
 * This approach avoids manually maintaining a static list of code tables,
 * ensuring the registry stays in sync with the database schema.
 */
export const CODE_TABLES = Prisma.dmmf.datamodel.models
  .filter((m) => m.name.endsWith('_code') && !NOT_CODE_TABLES.has(m.name))
  .map((m) => ({ name: toPascalCase(m.name), model: m.name }));
