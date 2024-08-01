/*
 * Shared application wide constants
 */

import { NIL } from 'uuid';
import { AccessRequestStatus, AccessRole, BasicResponse, Roles, UserSearchParams } from '../enums/application';

export const ACCESS_ROLES_LIST = [
  AccessRole.PCNS_ADMIN,
  AccessRole.PCNS_DEVELOPER,
  AccessRole.PCNS_NAVIGATOR,
  AccessRole.PCNS_PROPONENT,
  AccessRole.PCNS_SUPERVISOR
];

export const DELIMITER = '/';

export const PCNS_CONTACT = {
  email: 'NRM.PermittingAndData@gov.bc.ca',
  subject: 'Reporting an Issue with PCNS'
};

export const ROLES = [Roles.NAVIGATOR, Roles.READ_ONLY];

export const ACCESS_REQUEST_STATUS = [
  AccessRequestStatus.APPROVED,
  AccessRequestStatus.PENDING,
  AccessRequestStatus.REJECTED
];

export const SYSTEM_USER = NIL;

export const USER_SEARCH_PARAMS = [UserSearchParams.FIRST_NAME, UserSearchParams.LAST_NAME, UserSearchParams.EMAIL];

export const YES_NO_LIST = [BasicResponse.YES, BasicResponse.NO];
export const YES_NO_UNSURE_LIST = [BasicResponse.YES, BasicResponse.NO, BasicResponse.UNSURE];
