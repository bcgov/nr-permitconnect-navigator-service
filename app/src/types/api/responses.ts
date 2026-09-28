import type { z } from 'zod';
import type { createEnquiryResponseSchema } from '#src/schemas/response/enquiry';
import type { peachSummarySchema } from '#src/schemas/response/peachSummary';
import type { searchPermitsResponseSchema } from '#src/schemas/response/permit';

export type CreateEnquiryResponse = z.infer<typeof createEnquiryResponseSchema>;

export type PeachSummaryResponse = z.infer<typeof peachSummarySchema>;

export type SearchPermitsResponse = z.infer<typeof searchPermitsResponseSchema>;
