import { PermitStage, PermitState } from '#src/db/codes/enums';
import { SYSTEM_ID } from '#src/utils/constants/application';
import { BasicResponse, IdentityProviderKind, Initiative } from '#src/utils/enums/application';
import { NumResidentialUnits, ProjectApplicant, ProjectLocation } from '#src/utils/enums/housing';
import { PermitNeeded } from '#src/utils/enums/permit';
import {
  ActivityContactRole,
  ApplicationStatus,
  ContactPreference,
  ProjectRelationship,
  SubmissionType
} from '#src/utils/enums/projectCommon';

import type { Knex } from 'knex';

// Soft deletes follow the application's rules: deleteActivity soft deletes the activity with its project, contact
// links, permits and tracking, and deletePermitService soft deletes a permit with its tracking. Contacts, removed
// contact links and replaced tracking numbers are hard deleted, so they never appear soft deleted.

// Deterministic v4-shaped UUIDs so the seed can clean up after itself
const id = (n: number) => `5eed0000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const DELETED = { deleted_by: SYSTEM_ID, deleted_at: '2026-02-01 09:00:00.000 -0800' };

const NAVIGATORS = [
  { user_id: id(101), first_name: 'Morgan', last_name: 'Reyes' },
  { user_id: id(102), first_name: 'Priya', last_name: 'Natarajan' },
  { user_id: id(103), first_name: 'Liam', last_name: "O'Connell" }
];

const CONTACTS = [
  { contact_id: id(201), first_name: 'James', last_name: 'Garfield', preference: ContactPreference.PHONE_CALL },
  { contact_id: id(202), first_name: 'Sarah', last_name: 'Mitchell', preference: ContactPreference.EMAIL },
  { contact_id: id(203), first_name: 'Michael', last_name: 'Chen', preference: ContactPreference.EITHER },
  { contact_id: id(204), first_name: 'Emily', last_name: 'Thompson', preference: ContactPreference.EMAIL },
  { contact_id: id(205), first_name: 'David', last_name: 'Anderson', preference: ContactPreference.PHONE_CALL },
  { contact_id: id(206), first_name: 'Aiyana', last_name: 'Joseph', preference: ContactPreference.EITHER },
  { contact_id: id(207), first_name: 'Hiro', last_name: 'Tanaka', preference: ContactPreference.EMAIL },
  { contact_id: id(208), first_name: 'Fatima', last_name: 'Haddad', preference: ContactPreference.PHONE_CALL }
];

const [JAMES, SARAH, MICHAEL, EMILY, DAVID, AIYANA, HIRO, FATIMA] = CONTACTS.map((c) => c.contact_id);
const [MORGAN, PRIYA, LIAM] = NAVIGATORS.map((n) => n.user_id);

interface PermitSeed {
  type: number; // offset into the housing permit types
  needed: PermitNeeded;
  stage: PermitStage;
  state: PermitState;
  deleted?: boolean; // deletePermitService
  tracking?: { trackingId: string; shownToProponent?: boolean }[];
}

interface ProjectSeed {
  name: string;
  company?: string;
  locality: string;
  street: string;
  lat: number;
  long: number;
  status: ApplicationStatus;
  submissionType: SubmissionType;
  priority: number;
  submittedAt: string;
  assignedTo?: string;
  units: { single?: NumResidentialUnits; multi?: NumResidentialUnits; other?: NumResidentialUnits };
  rental?: NumResidentialUnits;
  supportedBy?: ('bc' | 'indigenous' | 'nonProfit' | 'housingCoop')[];
  naturalDisaster?: boolean;
  description: string;
  contacts: [string, ActivityContactRole][];
  permits?: PermitSeed[];
  deleted?: boolean; // deleteActivity
}

const PROJECTS: ProjectSeed[] = [
  {
    name: 'Trinity Commons',
    company: 'CAR BUFFS CAR CLEANING',
    locality: 'Victoria',
    street: '1120 Fort St',
    lat: 48.4232,
    long: -123.3527,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 3,
    submittedAt: '2026-01-05 10:12:00.000 -0800',
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    description: 'Infill townhouse development replacing a commercial lot.',
    contacts: [[JAMES, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Okanagan Ridge',
    company: 'PACIFIC VISTA DEVELOPMENTS',
    locality: 'Kelowna',
    street: '2450 Pandosy St',
    lat: 49.8659,
    long: -119.4935,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2025-11-18 14:30:00.000 -0800',
    assignedTo: MORGAN,
    units: { multi: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED },
    rental: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED,
    supportedBy: ['bc'],
    description: 'Mid-rise rental building with ground floor retail.',
    contacts: [
      [SARAH, ActivityContactRole.PRIMARY],
      [MICHAEL, ActivityContactRole.ADMIN]
    ],
    permits: [
      {
        type: 0,
        needed: PermitNeeded.YES,
        stage: PermitStage.TECHNICAL_REVIEW,
        state: PermitState.IN_PROGRESS,
        tracking: [{ trackingId: 'TRK-OKR-1001', shownToProponent: true }]
      },
      { type: 1, needed: PermitNeeded.YES, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE },
      // Deleted permit, so the multi-authorization count should show 2, not 3
      {
        type: 2,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        state: PermitState.WITHDRAWN,
        deleted: true,
        tracking: [{ trackingId: 'TRK-OKR-1002', shownToProponent: true }]
      }
    ]
  },
  {
    name: 'Riverbend Flats',
    company: 'THOMPSON RIVER HOMES LTD',
    locality: 'Kamloops',
    street: '455 Lansdowne St',
    lat: 50.6745,
    long: -120.3273,
    status: ApplicationStatus.DELAYED,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2025-09-02 09:05:00.000 -0700',
    assignedTo: PRIYA,
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE, other: NumResidentialUnits.ONE_TO_NINE },
    naturalDisaster: true,
    description: 'Rebuild of units lost to the 2025 flood season.',
    contacts: [[MICHAEL, ActivityContactRole.PRIMARY]],
    permits: [
      {
        type: 0,
        needed: PermitNeeded.YES,
        stage: PermitStage.PENDING_DECISION,
        state: PermitState.PENDING_APPLICANT_ACTION,
        tracking: [{ trackingId: 'TRK-RBF-2001', shownToProponent: true }, { trackingId: 'TRK-RBF-2002' }]
      }
    ]
  },
  {
    name: 'Harbourview Terrace',
    locality: 'Nanaimo',
    street: '78 Front St',
    lat: 49.1659,
    long: -123.9401,
    status: ApplicationStatus.COMPLETED,
    submissionType: SubmissionType.INAPPLICABLE,
    priority: 3,
    submittedAt: '2025-06-21 16:45:00.000 -0700',
    assignedTo: LIAM,
    units: { single: NumResidentialUnits.ONE_TO_NINE },
    description: 'Single family home with a secondary suite.',
    contacts: [[EMILY, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Northern Lights Village',
    company: 'SPRUCE CAPITAL HOUSING SOCIETY',
    locality: 'Prince George',
    street: '1600 15th Ave',
    lat: 53.9171,
    long: -122.7497,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2025-12-03 11:20:00.000 -0800',
    assignedTo: MORGAN,
    units: { multi: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED },
    rental: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED,
    supportedBy: ['nonProfit', 'bc'],
    description: 'Non-profit supportive housing with on-site services.',
    contacts: [
      [DAVID, ActivityContactRole.PRIMARY],
      [AIYANA, ActivityContactRole.MEMBER]
    ],
    permits: [
      {
        type: 0,
        needed: PermitNeeded.YES,
        stage: PermitStage.POST_DECISION,
        state: PermitState.APPROVED,
        tracking: [{ trackingId: 'TRK-NLV-3001', shownToProponent: true }]
      },
      { type: 1, needed: PermitNeeded.YES, stage: PermitStage.APPLICATION_SUBMISSION, state: PermitState.IN_PROGRESS },
      { type: 3, needed: PermitNeeded.UNDER_INVESTIGATION, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE }
    ]
  },
  {
    name: 'Fraser Crossing',
    company: 'CASCADIA URBAN PARTNERS INC',
    locality: 'Surrey',
    street: '10355 King George Blvd',
    lat: 49.1913,
    long: -122.849,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2026-01-20 08:40:00.000 -0800',
    units: { multi: NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED },
    rental: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED,
    description: 'Transit-oriented tower cluster near a SkyTrain station.',
    contacts: [
      [HIRO, ActivityContactRole.PRIMARY],
      [SARAH, ActivityContactRole.MEMBER]
    ]
  },
  {
    name: 'Metrotown Gardens',
    company: 'BURNABY HEIGHTS DEVELOPMENTS',
    locality: 'Burnaby',
    street: '4700 Kingsway',
    lat: 49.2276,
    long: -123.0016,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2025-10-11 13:15:00.000 -0700',
    assignedTo: PRIYA,
    units: { multi: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED },
    description: 'Strata condominium with amenity podium.',
    contacts: [[FATIMA, ActivityContactRole.PRIMARY]],
    permits: [
      { type: 0, needed: PermitNeeded.NO, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE },
      {
        type: 2,
        needed: PermitNeeded.YES,
        stage: PermitStage.POST_DECISION,
        state: PermitState.ISSUED,
        tracking: [{ trackingId: 'TRK-MTG-4001', shownToProponent: true }]
      }
    ]
  },
  {
    name: 'Valley Orchard Homes',
    locality: 'Abbotsford',
    street: '33100 South Fraser Way',
    lat: 49.0504,
    long: -122.3045,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 3,
    submittedAt: '2026-02-14 15:00:00.000 -0800',
    units: { single: NumResidentialUnits.ONE_TO_NINE, other: NumResidentialUnits.ONE_TO_NINE },
    description: 'Small lot subdivision on former orchard land.',
    contacts: [[EMILY, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Lakeshore Cottages',
    company: 'SKAHA SHORES LTD',
    locality: 'Penticton',
    street: '201 Lakeshore Dr W',
    lat: 49.4991,
    long: -119.5937,
    status: ApplicationStatus.DELAYED,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2025-08-29 10:00:00.000 -0700',
    assignedTo: LIAM,
    units: { single: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    rental: NumResidentialUnits.TEN_TO_FOURTY_NINE,
    naturalDisaster: true,
    description: 'Seasonal cottages converted to year-round rentals after wildfire displacement.',
    contacts: [
      [DAVID, ActivityContactRole.PRIMARY],
      [MICHAEL, ActivityContactRole.ADMIN]
    ],
    permits: [
      { type: 1, needed: PermitNeeded.YES, stage: PermitStage.TECHNICAL_REVIEW, state: PermitState.IN_PROGRESS }
    ]
  },
  {
    name: 'Silver Star Lofts',
    company: 'NORTH OKANAGAN BUILDERS',
    locality: 'Vernon',
    street: '3101 30th Ave',
    lat: 50.2671,
    long: -119.2722,
    status: ApplicationStatus.COMPLETED,
    submissionType: SubmissionType.GUIDANCE,
    priority: 3,
    submittedAt: '2025-05-07 12:30:00.000 -0700',
    assignedTo: MORGAN,
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    description: 'Conversion of a heritage warehouse into lofts.',
    contacts: [[SARAH, ActivityContactRole.PRIMARY]],
    permits: [
      { type: 0, needed: PermitNeeded.YES, stage: PermitStage.POST_DECISION, state: PermitState.APPROVED },
      { type: 1, needed: PermitNeeded.YES, stage: PermitStage.POST_DECISION, state: PermitState.DENIED }
    ]
  },
  {
    name: 'Kootenay Pines',
    company: 'ROCKY MOUNTAIN HOUSING CO-OP',
    locality: 'Cranbrook',
    street: '25 10th Ave S',
    lat: 49.5097,
    long: -115.7688,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2025-11-02 09:45:00.000 -0700',
    assignedTo: PRIYA,
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    rental: NumResidentialUnits.TEN_TO_FOURTY_NINE,
    supportedBy: ['housingCoop'],
    description: 'Housing co-operative with family sized units.',
    contacts: [[AIYANA, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Comox Valley Place',
    locality: 'Courtenay',
    street: '580 England Ave',
    lat: 49.6866,
    long: -124.9936,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.INAPPLICABLE,
    priority: 3,
    submittedAt: '2026-01-28 17:10:00.000 -0800',
    units: { single: NumResidentialUnits.ONE_TO_NINE },
    description: 'Duplex on an existing residential lot.',
    contacts: [[HIRO, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Sea to Sky Residences',
    company: 'HOWE SOUND DEVELOPMENTS',
    locality: 'Squamish',
    street: '38000 Cleveland Ave',
    lat: 49.7016,
    long: -123.1558,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2025-12-15 10:25:00.000 -0800',
    assignedTo: LIAM,
    units: { multi: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED, other: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    rental: NumResidentialUnits.TEN_TO_FOURTY_NINE,
    supportedBy: ['bc'],
    description: 'Mixed tenure development with employee housing.',
    contacts: [
      [FATIMA, ActivityContactRole.PRIMARY],
      [JAMES, ActivityContactRole.ADMIN],
      [EMILY, ActivityContactRole.MEMBER]
    ],
    permits: [
      {
        type: 0,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        state: PermitState.INITIAL_REVIEW,
        tracking: [{ trackingId: 'TRK-STS-5001' }]
      },
      { type: 2, needed: PermitNeeded.YES, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE },
      { type: 3, needed: PermitNeeded.NO, stage: PermitStage.PRE_SUBMISSION, state: PermitState.NONE, deleted: true }
    ]
  },
  {
    name: 'Skeena Heights',
    company: 'NORTHWEST HOMES LTD',
    locality: 'Terrace',
    street: '4600 Lakelse Ave',
    lat: 54.5163,
    long: -128.5997,
    status: ApplicationStatus.DELAYED,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2025-07-19 11:55:00.000 -0700',
    assignedTo: MORGAN,
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    supportedBy: ['indigenous'],
    description: 'Partnership with a local First Nation on family housing.',
    contacts: [
      [AIYANA, ActivityContactRole.PRIMARY],
      [DAVID, ActivityContactRole.MEMBER]
    ],
    permits: [
      { type: 1, needed: PermitNeeded.YES, stage: PermitStage.PENDING_DECISION, state: PermitState.IN_PROGRESS }
    ]
  },
  {
    name: 'Peace River Commons',
    company: 'ENERGY CITY BUILDERS',
    locality: 'Fort St. John',
    street: '9900 100 Ave',
    lat: 56.2465,
    long: -120.8476,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2026-02-02 08:15:00.000 -0800',
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    rental: NumResidentialUnits.TEN_TO_FOURTY_NINE,
    description: 'Workforce rental housing.',
    contacts: [[MICHAEL, ActivityContactRole.PRIMARY]]
  },
  {
    name: 'Sardis Meadows',
    locality: 'Chilliwack',
    street: '45600 Promontory Rd',
    lat: 49.1035,
    long: -121.9564,
    status: ApplicationStatus.COMPLETED,
    submissionType: SubmissionType.GUIDANCE,
    priority: 3,
    submittedAt: '2025-04-11 14:20:00.000 -0700',
    assignedTo: PRIYA,
    units: { single: NumResidentialUnits.ONE_TO_NINE },
    description: 'Carriage house addition.',
    contacts: [[SARAH, ActivityContactRole.PRIMARY]],
    permits: [{ type: 0, needed: PermitNeeded.NO, stage: PermitStage.POST_DECISION, state: PermitState.CANCELLED }]
  },
  {
    name: 'Westshore Landing',
    company: 'WESTSHORE LAND CORP',
    locality: 'Langford',
    street: '2800 Jacklin Rd',
    lat: 48.4506,
    long: -123.5058,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 2,
    submittedAt: '2025-10-30 10:05:00.000 -0700',
    assignedTo: LIAM,
    units: { multi: NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED },
    description: 'Phased apartment buildings around a new park.',
    contacts: [
      [HIRO, ActivityContactRole.PRIMARY],
      [MICHAEL, ActivityContactRole.MEMBER]
    ]
  },
  {
    name: 'Steveston Wharf Homes',
    company: 'RICHMOND DELTA BUILDERS',
    locality: 'Richmond',
    street: '3800 Bayview St',
    lat: 49.1253,
    long: -123.1838,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2026-01-11 09:30:00.000 -0800',
    assignedTo: MORGAN,
    units: { multi: NumResidentialUnits.TEN_TO_FOURTY_NINE },
    description: 'Townhomes on a waterfront redevelopment site.',
    contacts: [
      [EMILY, ActivityContactRole.PRIMARY],
      [HIRO, ActivityContactRole.ADMIN]
    ],
    permits: [
      {
        type: 2,
        needed: PermitNeeded.UNDER_INVESTIGATION,
        stage: PermitStage.PRE_SUBMISSION,
        state: PermitState.NONE,
        tracking: [{ trackingId: 'TRK-SWH-6001' }]
      }
    ]
  },
  {
    // Deleted activity, its contacts stay live on other projects
    name: 'Burquitlam Station Towers',
    company: 'TRI-CITIES DEVELOPMENT GROUP',
    locality: 'Coquitlam',
    street: '560 Clarke Rd',
    lat: 49.2604,
    long: -122.8891,
    status: ApplicationStatus.IN_PROGRESS,
    submissionType: SubmissionType.GUIDANCE,
    priority: 1,
    submittedAt: '2025-09-25 15:40:00.000 -0700',
    assignedTo: PRIYA,
    units: { multi: NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED },
    description: 'High-rise towers adjacent to a SkyTrain station.',
    contacts: [
      [FATIMA, ActivityContactRole.PRIMARY],
      [JAMES, ActivityContactRole.MEMBER]
    ],
    permits: [
      {
        type: 0,
        needed: PermitNeeded.YES,
        stage: PermitStage.APPLICATION_SUBMISSION,
        state: PermitState.IN_PROGRESS,
        tracking: [{ trackingId: 'TRK-BST-7001' }]
      }
    ],
    deleted: true
  },
  {
    // Deleted activity
    name: 'Baker Street Heritage',
    company: 'KOOTENAY LAKE HOMES',
    locality: 'Nelson',
    street: '502 Baker St',
    lat: 49.4928,
    long: -117.2948,
    status: ApplicationStatus.NEW,
    submissionType: SubmissionType.GUIDANCE,
    priority: 3,
    submittedAt: '2025-08-08 13:00:00.000 -0700',
    units: { multi: NumResidentialUnits.ONE_TO_NINE },
    description: 'Upper floor apartments above heritage retail.',
    contacts: [
      [DAVID, ActivityContactRole.PRIMARY],
      [AIYANA, ActivityContactRole.ADMIN]
    ],
    permits: [
      {
        type: 1,
        needed: PermitNeeded.YES,
        stage: PermitStage.PRE_SUBMISSION,
        state: PermitState.NONE,
        tracking: [{ trackingId: 'TRK-BAK-8001' }]
      }
    ],
    deleted: true
  }
];

const activityId = (index: number) => `AC${String(index + 1).padStart(6, '0')}`;
const housingProjectId = (index: number) => id(301 + index);
const permitId = (projectIndex: number, permitIndex: number) => id(1000 + projectIndex * 10 + permitIndex);

const supported = (project: ProjectSeed, key: NonNullable<ProjectSeed['supportedBy']>[number]) =>
  project.supportedBy?.includes(key) ? BasicResponse.YES : BasicResponse.NO;

export async function seed(knex: Knex): Promise<void> {
  const housingId = knex('initiative').where({ code: Initiative.HOUSING }).select('initiative_id');

  const housingPermitType = (offset: number) =>
    knex('permit_type_initiative_xref')
      .whereIn('initiative_id', housingId)
      .orderBy('permit_type_id')
      .offset(offset)
      .limit(1)
      .select('permit_type_id');

  const activityIds = PROJECTS.map((_, i) => activityId(i));

  // Clear previous runs of this seed, by ID prefix so rows dropped from it are removed too
  const seeded = (column: string) => knex.raw('??::text like ?', [column, `${id(0).slice(0, 24)}%`]);
  await knex('permit_tracking').where(seeded('permit_id')).del();
  await knex('permit').where(seeded('permit_id')).del();
  await knex('activity_contact').whereIn('activity_id', activityIds).del();
  await knex('housing_project').whereIn('activity_id', activityIds).del();
  await knex('activity').whereIn('activity_id', activityIds).del();
  await knex('contact').where(seeded('contact_id')).del();
  await knex('user').where(seeded('user_id')).del();

  await knex('user').insert(
    NAVIGATORS.map((n) => ({
      ...n,
      full_name: `${n.first_name} ${n.last_name}`,
      email: `${n.first_name.toLowerCase()}.${n.last_name.toLowerCase().replace(/\W/g, '')}@gov.bc.ca`,
      idp: IdentityProviderKind.AZUREIDIR,
      sub: `seed-${n.user_id}@${IdentityProviderKind.AZUREIDIR}`
    }))
  );

  await knex('contact').insert(
    CONTACTS.map(({ contact_id, first_name, last_name, preference }, i) => ({
      contact_id,
      first_name,
      last_name,
      email: `${first_name.toLowerCase()}.${last_name.toLowerCase()}@example.com`,
      phone_number: `(250) 555-${String(1000 + i * 137).slice(-4)}`,
      contact_preference: preference,
      contact_applicant_relationship: i % 3 === 0 ? ProjectRelationship.CONSULTANT : ProjectRelationship.OWNER
    }))
  );

  await knex('activity').insert(
    PROJECTS.map((p, i) => ({
      activity_id: activityId(i),
      initiative_id: housingId,
      created_at: p.submittedAt,
      ...(p.deleted && DELETED)
    }))
  );

  await knex('activity_contact').insert(
    PROJECTS.flatMap((p, i) =>
      p.contacts.map(([contact_id, role]) => ({
        activity_id: activityId(i),
        contact_id,
        role,
        ...(p.deleted && DELETED)
      }))
    )
  );

  await knex('housing_project').insert(
    PROJECTS.map((p, i) => ({
      housing_project_id: housingProjectId(i),
      activity_id: activityId(i),
      project_name: p.name,
      project_description: p.description,
      project_applicant_type: p.company ? ProjectApplicant.BUSINESS : ProjectApplicant.INDIVIDUAL,
      company_name_registered: p.company ?? null,
      application_status: p.status,
      submission_type: p.submissionType,
      queue_priority: p.priority,
      submitted_at: p.submittedAt,
      submitted_by: 'system',
      assigned_user_id: p.assignedTo ?? null,
      project_location: ProjectLocation.STREET_ADDRESS,
      street_address: p.street,
      locality: p.locality,
      province: 'BC',
      latitude: p.lat,
      longitude: p.long,
      single_family_units: p.units.single ?? null,
      multi_family_units: p.units.multi ?? null,
      other_units: p.units.other ?? null,
      other_units_description: p.units.other ? 'Secondary suites' : null,
      has_rental_units: p.rental ? BasicResponse.YES : BasicResponse.NO,
      rental_units: p.rental ?? null,
      financially_supported: Boolean(p.supportedBy?.length),
      financially_supported_bc: supported(p, 'bc'),
      financially_supported_indigenous: supported(p, 'indigenous'),
      financially_supported_non_profit: supported(p, 'nonProfit'),
      financially_supported_housing_coop: supported(p, 'housingCoop'),
      natural_disaster: p.naturalDisaster ?? false,
      consent_to_feedback: i % 2 === 0,
      created_at: p.submittedAt,
      ...(p.deleted && DELETED)
    }))
  );

  await knex('permit').insert(
    PROJECTS.flatMap((p, i) =>
      (p.permits ?? []).map((permit, j) => ({
        permit_id: permitId(i, j),
        activity_id: activityId(i),
        permit_type_id: housingPermitType(permit.type),
        needed: permit.needed,
        stage: permit.stage,
        state: permit.state,
        ...((permit.deleted || p.deleted) && DELETED)
      }))
    )
  );

  await knex('permit_tracking').insert(
    PROJECTS.flatMap((p, i) =>
      (p.permits ?? []).flatMap((permit, j) =>
        (permit.tracking ?? []).map((tracking) => ({
          permit_id: permitId(i, j),
          tracking_id: tracking.trackingId,
          shown_to_proponent: tracking.shownToProponent ?? false,
          ...((permit.deleted || p.deleted) && DELETED)
        }))
      )
    )
  );
}
