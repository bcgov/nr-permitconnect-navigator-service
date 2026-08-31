import type { z } from 'zod';
import type { schema as accessRequestSchema } from '#src/validators/accessRequest';
import type { schema as activityContactSchema } from '#src/validators/activityContact';
import type { schema as atsSchema } from '#src/validators/ats';
import type { schema as contactSchema } from '#src/validators/contact';
import type { schema as documentSchema } from '#src/validators/document';
import type { schema as electrificationProjectSchema } from '#src/validators/electrificationProject';
import type { schema as enquirySchema } from '#src/validators/enquiry';
import type { schema as generalProjectSchema } from '#src/validators/generalProject';
import type { schema as housingProjectSchema } from '#src/validators/housingProject';
import type { schema as noteHistorySchema } from '#src/validators/noteHistory';
import type { schema as peachSchema } from '#src/validators/peach';
import type { schema as permitSchema } from '#src/validators/permit';
import type { schema as permitTypeSchema } from '#src/validators/permitType';
import type { schema as roadmapSchema } from '#src/validators/roadmap';
import type { schema as ssoSchema } from '#src/validators/sso';
import type { schema as userSchema } from '#src/validators/user';
import type { schema as yarsSchema } from '#src/validators/yars';

/**
 * Access Request
 */

export type CreateUserAccessRequestRequest = z.infer<typeof accessRequestSchema.createUserAccessRequest.body>;
export type ProcessUserAccessRequestRequest = z.infer<typeof accessRequestSchema.processUserAccessRequest.body>;

/**
 * Activity Contact
 */

export type CreateActivityContactRequest = z.infer<typeof activityContactSchema.createActivityContact.body>;
export type UpdateActivityContactRequest = z.infer<typeof activityContactSchema.updateActivityContact.body>;

/**
 * ATS
 */

export type CreateAtsClientRequest = z.infer<typeof atsSchema.createATSClient.body>;
export type CreateAtsEnquiryRequest = z.infer<typeof atsSchema.createATSEnquiry.body>;
export type SearchAtsUsersRequest = z.infer<typeof atsSchema.searchATSUsers.query>;

/**
 * Contact
 */

export type GetContactRequest = z.infer<typeof contactSchema.getContact.query>;
export type MatchContactsRequest = z.infer<typeof contactSchema.matchContacts.body>;
export type SearchContactsRequest = z.infer<typeof contactSchema.searchContacts.body>;
export type UpsertContactRequest = z.infer<typeof contactSchema.upsertContact.body>;

/**
 * Document
 */

export type CreateDocumentRequest = z.infer<typeof documentSchema.createDocument.body>;

/**
 * Electrification Project
 */

export type SearchElectrificationProjectRequest = z.infer<
  typeof electrificationProjectSchema.searchElectrificationProjects.body
>;
export type PatchElectrificationProjectRequest = z.infer<
  typeof electrificationProjectSchema.patchElectrificationProject.body
>;
// Identical getStatistics query shape shared by electrification/general/housing project validators.
export type GetProjectStatisticsRequest = z.infer<typeof electrificationProjectSchema.getStatistics.query>;
export type UpsertElectrificationProjectDraftRequest = z.infer<typeof electrificationProjectSchema.upsertDraft.body>;

/**
 * Enquiry
 */

export type SearchEnquiriesRequest = z.infer<typeof enquirySchema.searchEnquiries.body>;
export type PatchEnquiryRequest = z.infer<typeof enquirySchema.patchEnquiry.body>;

/**
 * General Project
 */

export type SearchGeneralProjectRequest = z.infer<typeof generalProjectSchema.searchGeneralProjects.body>;
export type PatchGeneralProjectRequest = z.infer<typeof generalProjectSchema.patchGeneralProject.body>;
export type UpsertGeneralProjectDraftRequest = z.infer<typeof generalProjectSchema.upsertDraft.body>;

/**
 * Housing Project
 */

export type SearchHousingProjectRequest = z.infer<typeof housingProjectSchema.searchHousingProjects.body>;
export type PatchHousingProjectRequest = z.infer<typeof housingProjectSchema.patchHousingProject.body>;
export type UpsertHousingProjectDraftRequest = z.infer<typeof housingProjectSchema.upsertDraft.body>;

/**
 * Note History
 */

export type CreateNoteHistoryRequest = z.infer<typeof noteHistorySchema.createNoteHistory.body>;
export type ListBringForwardsRequest = z.infer<typeof noteHistorySchema.listBringForwards.query>;
export type PatchNoteHistoryRequest = z.infer<typeof noteHistorySchema.patchNoteHistory.body>;

/**
 * Peach
 */

export type GetPeachSummaryRequest = z.infer<typeof peachSchema.getPeachSummary.body>;

/**
 * Permit
 */

// Full validated request body, as received by the controller (includes the nested relations below).
export type UpsertPermitBodyRequest = z.infer<typeof permitSchema.upsertPermit.body>;
// permitType, permitNote, and permitTracking are read-only relations (validated but never written this way) -
// omitted to match how domains/*.ts and services/permit.ts already construct and pass these objects straight
// to Prisma's unchecked write input, which needs relation scalars/nested-writes, not the validated read shape.
export type UpsertPermitRequest = Omit<UpsertPermitBodyRequest, 'permitType' | 'permitNote' | 'permitTracking'>;
export type IntakePermitRequest = z.infer<typeof permitSchema.intakePermit.body>[number];
export type ListPermitsRequest = z.infer<typeof permitSchema.listPermits.query>;
export type SearchPermitsRequest = z.infer<typeof permitSchema.searchPermits.query>;

/**
 * Permit Type
 */

export type ListPermitTypesRequest = z.infer<typeof permitTypeSchema.listPermitTypes.query>;

/**
 * Roadmap
 */

export type GetRoadmapNoteRequest = z.infer<typeof roadmapSchema.getRoadmapNote.query>;
export type SendRoadmapRequest = z.infer<typeof roadmapSchema.send.body>;

/**
 * SSO
 */

export type SearchIdirUsersRequest = z.infer<typeof ssoSchema.searchIdirUsers.query>;

/**
 * User
 */

export type SearchUsersRequest = z.infer<typeof userSchema.searchUsers.body>;

/**
 * Yars
 */

export type GetGroupsRequest = z.infer<typeof yarsSchema.getGroups.query>;
export type ListPermissionsRequest = z.infer<typeof yarsSchema.listPermissions.query>;
export type DeleteSubjectGroupRequest = z.infer<typeof yarsSchema.deleteSubjectGroup.body>;
