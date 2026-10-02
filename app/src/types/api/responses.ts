import type { z } from 'zod';
import { PermitStage, PermitState, PiesOnHold } from '#src/db/codes/enums';
import type { createEnquiryResponseSchema } from '#src/schemas/response/enquiry';
import type { peachSummarySchema } from '#src/schemas/response/peachSummary';
import type { searchPermitsResponseSchema } from '#src/schemas/response/permit';
import type { Project } from '#types';

export type CreateEnquiryResponse = z.infer<typeof createEnquiryResponseSchema>;

export type PeachSummaryResponse = z.infer<typeof peachSummarySchema>;

export type SearchPermitsResponse = z.infer<typeof searchPermitsResponseSchema>;

export interface PeachSummary {
  stage: PermitStage;
  state: PermitState;
  onHoldCode?: PiesOnHold;
  submittedDate: string | null;
  submittedTime: string | null;
  decisionDate: string | null;
  decisionTime: string | null;
  statusLastChanged: string;
  statusLastChangedTime: string | null;
}

export interface SearchProjectResponse {
  projects: Project[];
  totalRecords: number;
}
