import { Prisma } from '@prisma/client';

// Code tables are defined in the database with a naming convention of `<name>_code` (e.g. `permit_stage_code`).
// To exclude any tables that end with `_code`, add them to the `NOT_CODE_TABLES` set below.
const NOT_CODE_TABLES = new Set(['draft_code']);

const toPascalCase = (name: string) =>
  name
    .replace(/_code$/, '')
    .split('_')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join('');

export const CODE_TABLES = Prisma.dmmf.datamodel.models
  .filter((m) => m.name.endsWith('_code') && !NOT_CODE_TABLES.has(m.name))
  .map((m) => ({ name: toPascalCase(m.name), model: m.name }));
