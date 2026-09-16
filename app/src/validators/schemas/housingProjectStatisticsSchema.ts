import { z } from 'zod';

import '#src/validators/openapi';

// Not Prisma-backed - the result of the get_housing_statistics() SQL function, see
// src/services/housingProject.ts:79-99 and src/types/api/reports.ts:41
export const housingProjectStatisticsSchema = z
  .object({
    total_submissions: z.number(),
    total_submissions_between: z.number(),
    total_submissions_monthyear: z.number(),
    total_submissions_assignedto: z.number(),
    state_new: z.number(),
    state_inprogress: z.number(),
    state_delayed: z.number(),
    state_completed: z.number(),
    supported_bc: z.number(),
    supported_indigenous: z.number(),
    supported_non_profit: z.number(),
    supported_housing_coop: z.number(),
    queue_1: z.number(),
    queue_2: z.number(),
    queue_3: z.number(),
    escalation: z.number(),
    general_enquiry: z.number(),
    guidance: z.number(),
    inapplicable: z.number(),
    status_request: z.number(),
    multi_permits_needed: z.number()
  })
  .strict()
  .openapi('HousingProjectStatistics');
