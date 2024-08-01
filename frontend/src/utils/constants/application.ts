/*
 * Shared application wide constants
 */

import { NIL } from 'uuid';
import { BasicResponse, GroupName } from '../enums/application';

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

export const ACTIVITY_ID_LENGTH = 8;

export const GROUP_NAME_LIST = [
  GroupName.ADMIN,
  GroupName.DEVELOPER,
  GroupName.NAVIGATOR,
  GroupName.PROPONENT,
  GroupName.SUPERVISOR
];
