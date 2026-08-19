import type { PermitStage, PermitState, PiesOnHold } from '#src/db/codes/enums';

/** Create bolts a top-level `contact` onto the response; not a real Enquiry relation, kept off `Enquiry` itself. */
export type CreateEnquiryResponse = Enquiry & { contact: Contact };

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

export interface SearchPermitsResponse {
  permits: {
    permitId: string;
    activityId: string;
    permitTypeId: number;
    decisionDate: string | null;
    stage: string;
    state: string;
    statusLastChanged: string | null;
    submittedDate: string | null;
    permitType: {
      businessDomain: string;
      name: string;
    };
    project: {
      projectId: string;
      projectName: string | null;
      companyNameRegistered: string | null;
      streetAddress?: string | null;
      locality?: string | null;
      province?: string | null;
    } | null;
  }[];
  totalRecords: number;
}
