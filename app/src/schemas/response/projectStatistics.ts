import { z } from 'zod';

import '#src/schemas/openapi';

// Not Prisma-backed - the common fields shared by get_electrification_statistics(),
// get_general_statistics(), and get_housing_statistics() SQL functions, see
// src/types/api/reports.ts. Housing's SQL function additionally returns the supported_* fields.
const projectStatisticsBaseSchema = z.object({
  total_submissions: z.number(),
  total_submissions_between: z.number(),
  total_submissions_monthyear: z.number(),
  total_submissions_assignedto: z.number(),
  state_new: z.number(),
  state_inprogress: z.number(),
  state_delayed: z.number(),
  state_completed: z.number(),
  queue_1: z.number(),
  queue_2: z.number(),
  queue_3: z.number(),
  escalation: z.number(),
  general_enquiry: z.number(),
  guidance: z.number(),
  inapplicable: z.number(),
  status_request: z.number(),
  multi_permits_needed: z.number()
});

export const electrificationProjectStatisticsSchema = projectStatisticsBaseSchema
  .strict()
  .openapi('ElectrificationProjectStatistics');

export const generalProjectStatisticsSchema = projectStatisticsBaseSchema.strict().openapi('GeneralProjectStatistics');

export const housingProjectStatisticsSchema = projectStatisticsBaseSchema
  .extend({
    supported_bc: z.number(),
    supported_indigenous: z.number(),
    supported_non_profit: z.number(),
    supported_housing_coop: z.number()
  })
  .strict()
  .openapi('HousingProjectStatistics');
