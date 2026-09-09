import { z } from 'zod';

import { validate } from '#src/middleware/validation';
import { Initiative } from '#src/utils/enums/application';

export const permitTypeSchema = z
  .object({
    permitTypeId: z.number().max(255),
    agency: z.string().min(1).max(255),
    division: z.string().max(255).nullish(),
    branch: z.string().max(255).nullish(),
    businessDomain: z.string().max(255).nullish(),
    type: z.string().min(1).max(255),
    family: z.string().max(255).nullish(),
    name: z.string().min(1).max(255),
    nameSubtype: z.string().max(255).nullish(),
    acronym: z.string().max(255).nullish(),
    infoUrl: z.string().max(255).nullish(),
    trackedInAts: z.boolean(),
    sourceSystem: z.string().max(255).nullish(),
    sourceSystemAcronym: z.string().max(255).nullish()
  })
  .strict();

export const schema = {
  listPermitTypes: {
    query: z
      .object({
        initiative: z.enum(Object.keys(Initiative) as [string, ...string[]]).nullish()
      })
      .strict()
  }
};

export default {
  listPermitTypes: validate(schema.listPermitTypes)
};
