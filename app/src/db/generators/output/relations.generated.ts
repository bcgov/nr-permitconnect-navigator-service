/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * @see app/src/db/generators/relations.ts
 *
 * Regenerated automatically by `npm run prisma:generate`
 * (via the postprisma:generate hook). Do not run `prisma:relations` directly.
 */

export interface RelationInfo {
  targetModel: string;
  isList: boolean;
}

export const modelRelations: Record<string, Record<string, RelationInfo>> = {
  access_request: { user: { targetModel: 'user', isList: false }, group: { targetModel: 'group', isList: false } },
  activity: {
    initiative: { targetModel: 'initiative', isList: false },
    activityContact: { targetModel: 'activity_contact', isList: true },
    document: { targetModel: 'document', isList: true },
    draft: { targetModel: 'draft', isList: true },
    electrificationProject: { targetModel: 'electrification_project', isList: false },
    enquiry: { targetModel: 'enquiry', isList: true },
    generalProject: { targetModel: 'general_project', isList: false },
    housingProject: { targetModel: 'housing_project', isList: false },
    noteHistory: { targetModel: 'note_history', isList: true },
    permit: { targetModel: 'permit', isList: true }
  },
  activity_contact: {
    activity: { targetModel: 'activity', isList: false },
    contact: { targetModel: 'contact', isList: false }
  },
  contact: {
    activityContact: { targetModel: 'activity_contact', isList: true },
    user: { targetModel: 'user', isList: false }
  },
  document: { activity: { targetModel: 'activity', isList: false } },
  enquiry: { activity: { targetModel: 'activity', isList: false }, user: { targetModel: 'user', isList: false } },
  identity_provider: { user: { targetModel: 'user', isList: true } },
  initiative: {
    activity: { targetModel: 'activity', isList: true },
    permitTypeInitiativeXref: { targetModel: 'permit_type_initiative_xref', isList: true },
    group: { targetModel: 'group', isList: true }
  },
  permit: {
    activity: { targetModel: 'activity', isList: false },
    piesOnHoldCode: { targetModel: 'pies_on_hold_code', isList: false },
    permitType: { targetModel: 'permit_type', isList: false },
    permitStageCode: { targetModel: 'permit_stage_code', isList: false },
    permitStateCode: { targetModel: 'permit_state_code', isList: false },
    permitNote: { targetModel: 'permit_note', isList: true },
    permitTracking: { targetModel: 'permit_tracking', isList: true }
  },
  permit_note: { permit: { targetModel: 'permit', isList: false } },
  permit_type: {
    permit: { targetModel: 'permit', isList: true },
    sourceSystemCode: { targetModel: 'source_system_code', isList: false },
    permitTypeInitiativeXref: { targetModel: 'permit_type_initiative_xref', isList: true },
    permitTypeSourceSystemKindXref: { targetModel: 'permit_type_source_system_kind_xref', isList: true }
  },
  user: {
    accessRequest: { targetModel: 'access_request', isList: true },
    contact: { targetModel: 'contact', isList: true },
    electrificationProject: { targetModel: 'electrification_project', isList: true },
    enquiry: { targetModel: 'enquiry', isList: true },
    generalProject: { targetModel: 'general_project', isList: true },
    housingProject: { targetModel: 'housing_project', isList: true },
    identityProvider: { targetModel: 'identity_provider', isList: false }
  },
  action: { policy: { targetModel: 'policy', isList: true } },
  attribute: {
    attributeGroup: { targetModel: 'attribute_group', isList: true },
    policyAttribute: { targetModel: 'policy_attribute', isList: true }
  },
  attribute_group: {
    attribute: { targetModel: 'attribute', isList: false },
    group: { targetModel: 'group', isList: false }
  },
  group: {
    accessRequest: { targetModel: 'access_request', isList: true },
    attributeGroup: { targetModel: 'attribute_group', isList: true },
    initiative: { targetModel: 'initiative', isList: false },
    groupRole: { targetModel: 'group_role', isList: true },
    subjectGroup: { targetModel: 'subject_group', isList: true }
  },
  group_role: { group: { targetModel: 'group', isList: false }, role: { targetModel: 'role', isList: false } },
  policy: {
    action: { targetModel: 'action', isList: false },
    resource: { targetModel: 'resource', isList: false },
    policyAttribute: { targetModel: 'policy_attribute', isList: true },
    rolePolicy: { targetModel: 'role_policy', isList: true }
  },
  policy_attribute: {
    attribute: { targetModel: 'attribute', isList: false },
    policy: { targetModel: 'policy', isList: false }
  },
  resource: { policy: { targetModel: 'policy', isList: true } },
  role: {
    groupRole: { targetModel: 'group_role', isList: true },
    rolePolicy: { targetModel: 'role_policy', isList: true }
  },
  role_policy: { policy: { targetModel: 'policy', isList: false }, role: { targetModel: 'role', isList: false } },
  subject_group: { group: { targetModel: 'group', isList: false } },
  draft: {
    activity: { targetModel: 'activity', isList: false },
    draftCodeDraftDraftCodeTodraftCode: { targetModel: 'draft_code', isList: false }
  },
  draft_code: { draftDraftDraftCodeTodraftCode: { targetModel: 'draft', isList: true } },
  electrification_project_category_code: {
    electrificationProject: { targetModel: 'electrification_project', isList: true }
  },
  electrification_project_type_code: {
    electrificationProject: { targetModel: 'electrification_project', isList: true }
  },
  housing_project: {
    activity: { targetModel: 'activity', isList: false },
    user: { targetModel: 'user', isList: false }
  },
  note: { noteHistory: { targetModel: 'note_history', isList: false } },
  electrification_project: {
    activity: { targetModel: 'activity', isList: false },
    user: { targetModel: 'user', isList: false },
    electrificationProjectCategoryCode: { targetModel: 'electrification_project_category_code', isList: false },
    electrificationProjectTypeCode: { targetModel: 'electrification_project_type_code', isList: false }
  },
  permit_type_initiative_xref: {
    initiative: { targetModel: 'initiative', isList: false },
    permitType: { targetModel: 'permit_type', isList: false }
  },
  permit_tracking: {
    permit: { targetModel: 'permit', isList: false },
    sourceSystemKind: { targetModel: 'source_system_kind', isList: false }
  },
  source_system_code: {
    permitType: { targetModel: 'permit_type', isList: true },
    sourceSystemKind: { targetModel: 'source_system_kind', isList: true }
  },
  source_system_kind: {
    permitTracking: { targetModel: 'permit_tracking', isList: true },
    permitTypeSourceSystemKindXref: { targetModel: 'permit_type_source_system_kind_xref', isList: true },
    sourceSystemCode: { targetModel: 'source_system_code', isList: false }
  },
  note_history: {
    note: { targetModel: 'note', isList: true },
    activity: { targetModel: 'activity', isList: false },
    escalationTypeCode: { targetModel: 'escalation_type_code', isList: false }
  },
  escalation_type_code: { noteHistory: { targetModel: 'note_history', isList: true } },
  permit_type_source_system_kind_xref: {
    permitType: { targetModel: 'permit_type', isList: false },
    sourceSystemKind: { targetModel: 'source_system_kind', isList: false }
  },
  business_area_code: { generalProject: { targetModel: 'general_project', isList: true } },
  general_project: {
    activity: { targetModel: 'activity', isList: false },
    user: { targetModel: 'user', isList: false },
    businessAreaCode: { targetModel: 'business_area_code', isList: false }
  },
  permit_stage_code: { permit: { targetModel: 'permit', isList: true } },
  permit_state_code: { permit: { targetModel: 'permit', isList: true } },
  pies_on_hold_code: { permit: { targetModel: 'permit', isList: true } }
};
