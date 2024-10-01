/*
 * Shared application wide constants
 */

import { NIL } from 'uuid';

import { AccessRequestStatus, BasicResponse, GroupName, UserSearchParams } from '../enums/application';

export const ACCESS_REQUEST_STATUS = [
  AccessRequestStatus.APPROVED,
  AccessRequestStatus.PENDING,
  AccessRequestStatus.REJECTED
];

export const ACTIVITY_ID_LENGTH = 8;

export const DELIMITER = '/';

export const PCNS_CONTACT = {
  email: 'NRM.PermittingAndData@gov.bc.ca',
  subject: 'Reporting an Issue with PCNS'
};

export const GROUP_NAME_LIST = [
  GroupName.ADMIN,
  GroupName.NAVIGATOR,
  GroupName.NAVIGATOR_READ_ONLY,
  GroupName.PROPONENT,
  GroupName.SUPERVISOR
];

export const MANAGED_GROUP_NAME_LIST = [
  GroupName.ADMIN,
  GroupName.NAVIGATOR,
  GroupName.NAVIGATOR_READ_ONLY,
  GroupName.SUPERVISOR
];

export const SPATIAL_FILE_FORMATS = [
  '.cpg',
  '.dbf',
  '.geojson',
  '.gml',
  '.gpx',
  '.kml',
  '.kmz',
  '.pdf',
  '.prj',
  '.sbn',
  '.sbx',
  '.shp',
  '.shx',
  '.wkt',
  '.xml'
];

export const SYSTEM_USER = NIL;

export const USER_SEARCH_PARAMS = [UserSearchParams.FIRST_NAME, UserSearchParams.LAST_NAME, UserSearchParams.EMAIL];

export const YES_NO_LIST = [BasicResponse.YES, BasicResponse.NO];
export const YES_NO_UNSURE_LIST = [BasicResponse.YES, BasicResponse.NO, BasicResponse.UNSURE];
