// Internal function-parameter bags for src/domains/* logic - not request or resource shapes.

import type {
  CreateEnquiryRequest,
  CreateNoteHistoryRequest,
  CreateUserAccessRequestRequest,
  GetElectrificationProjectStatisticsRequest,
  GetGeneralProjectStatisticsRequest,
  GetHousingProjectStatisticsRequest,
  IntakePermitRequest,
  ListPermitsRequest,
  PatchElectrificationProjectRequest,
  PatchEnquiryRequest,
  PatchGeneralProjectRequest,
  PatchHousingProjectRequest,
  PatchNoteHistoryRequest,
  SearchElectrificationProjectRequest,
  SearchEnquiriesRequest,
  SearchGeneralProjectRequest,
  SearchHousingProjectRequest,
  SearchPermitsRequest,
  SubmitElectrificationProjectDraftRequest,
  SubmitGeneralProjectDraftRequest,
  SubmitHousingProjectDraftRequest,
  UpsertContactRequest,
  UpsertPermitBodyRequest,
  UpsertPermitRequest
} from './api/requests.ts';
import type { Permit } from './api/resources.ts';
import type { EmailTemplate } from '#src/utils/templates';
import type { Initiative } from '#src/utils/enums/application';

// Same shapes as their *Request counterparts (types/api/requests.ts) - named for consumers past the
// controller layer (service/domain) so they don't import a controller-owned *Request type directly.
export type GetHousingProjectStatisticsInput = GetHousingProjectStatisticsRequest;
export type SearchHousingProjectInput = SearchHousingProjectRequest;
export type PatchHousingProjectInput = PatchHousingProjectRequest;
export type SubmitHousingProjectDraftInput = SubmitHousingProjectDraftRequest;

export type GetElectrificationProjectStatisticsInput = GetElectrificationProjectStatisticsRequest;
export type SearchElectrificationProjectInput = SearchElectrificationProjectRequest;
export type PatchElectrificationProjectInput = PatchElectrificationProjectRequest;
export type SubmitElectrificationProjectDraftInput = SubmitElectrificationProjectDraftRequest;

export type GetGeneralProjectStatisticsInput = GetGeneralProjectStatisticsRequest;
export type SearchGeneralProjectInput = SearchGeneralProjectRequest;
export type PatchGeneralProjectInput = PatchGeneralProjectRequest;
export type SubmitGeneralProjectDraftInput = SubmitGeneralProjectDraftRequest;

export type CreateEnquiryInput = CreateEnquiryRequest;
export type SearchEnquiriesInput = SearchEnquiriesRequest;
export type PatchEnquiryInput = PatchEnquiryRequest;

export type UpsertContactInput = UpsertContactRequest;

export type CreateNoteHistoryInput = CreateNoteHistoryRequest;
export type PatchNoteHistoryInput = PatchNoteHistoryRequest;

export type CreateUserAccessRequestInput = CreateUserAccessRequestRequest;

export type IntakePermitInput = IntakePermitRequest;
export type ListPermitsInput = ListPermitsRequest;
export type SearchPermitsInput = SearchPermitsRequest;
export type UpsertPermitBodyInput = UpsertPermitBodyRequest;
export type UpsertPermitInput = UpsertPermitRequest;

export interface PermitUpdateEmailParams {
  permit: Permit;
  initiative: Initiative;
  dearName: string;
  projectId: string;
  toEmails: string[];
  emailTemplate: EmailTemplate;
}

export interface UpdatedPermitWithNote {
  permit: Permit;
  note: string | undefined;
}
