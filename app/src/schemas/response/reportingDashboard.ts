import z from 'zod';

export const reportingDashboardSchema = z.object({ url: z.url().nullable() });
