// Internal search/filter parameter shapes used by service and repository layers. These are not
// request types - a validated request is normalized into one of these at the controller boundary
// (see e.g. matchContactsController, searchUsersController), since a resource's several search-style
// endpoints (search vs. match vs. list) often validate different field sets but share one filter shape.

import type { GroupName, Initiative } from '#src/utils/enums/application';

export interface ContactSearchParameters {
  contactApplicantRelationship?: string;
  contactPreference?: string;
  contactId?: string[];
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userId?: string[];
  initiative?: Initiative | string;
  includeActivities?: boolean;
}

export interface UserSearchParameters {
  userId?: string[];
  idp?: string[];
  group?: GroupName[];
  sub?: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
  includeUserGroups?: boolean;
  initiative?: Initiative[];
}
