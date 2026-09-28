import type { z } from 'zod';
import type {
  electrificationProjectStatisticsSchema,
  generalProjectStatisticsSchema,
  housingProjectStatisticsSchema
} from '#src/schemas/response/projectStatistics';

export type ElectrificationProjectStatistics = z.infer<typeof electrificationProjectStatisticsSchema>;

export type GeneralProjectStatistics = z.infer<typeof generalProjectStatisticsSchema>;

export type HousingProjectStatistics = z.infer<typeof housingProjectStatisticsSchema>;
