import { z } from 'zod';

import '#src/validators/openapi';

// Raw SQL projection (src/services/reporting.ts) joining project/activity/contact/permit/permitType
// - column types mirror the equivalent Prisma model fields, not generated from them.
export const reportingPermitDataSchema = z
  .object({
    project_name: z.string().nullable(),
    first_name: z.string().nullable(),
    last_name: z.string().nullable(),
    phone_number: z.string().nullable(),
    email: z.string().nullable(),
    contact_preference: z.string().nullable(),
    contact_applicant_relationship: z.string().nullable(),
    activity_id: z.string(),
    submission_type: z.string().nullable(),
    application_status: z.string().nullable(),
    issued_permit_id: z.string().nullable(),
    tracking_id: z.string().nullable(),
    state: z.string().nullable(),
    needed: z.string().nullable(),
    stage: z.string().nullable(),
    submitted_date: z.date().nullable(),
    submitted_time: z.date().nullable(),
    decision_date: z.date().nullable(),
    decision_time: z.date().nullable(),
    status_last_verified: z.date().nullable(),
    status_last_verified_time: z.date().nullable(),
    status_last_changed: z.date().nullable(),
    status_last_changed_time: z.date().nullable(),
    agency: z.string().nullable(),
    division: z.string().nullable(),
    branch: z.string().nullable(),
    permit_type: z.string().nullable(),
    family: z.string().nullable(),
    name: z.string().nullable(),
    acronym: z.string().nullable(),
    tracked_in_ats: z.boolean().nullable(),
    source_system: z.string().nullable(),
    source_system_acronym: z.string().nullable()
  })
  .openapi('ReportingPermitData');

// Raw SQL projection (src/services/reporting.ts) joining housing_project/activity/contact/permit/
// permitType - column types mirror the equivalent Prisma model fields, not generated from them.
export const housingReportingPermitDataSchema = reportingPermitDataSchema
  .extend({
    consent_to_feedback: z.enum(['Yes', 'No']),
    street_address: z.string().nullable(),
    locality: z.string().nullable(),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
    location_pids: z.string().nullable()
  })
  .openapi('HousingReportingPermitData');
