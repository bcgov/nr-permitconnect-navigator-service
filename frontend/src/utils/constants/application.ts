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

export const DELIMITER = '/';

export const ISO_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export const PCNS_CONTACT = {
  email: 'NRM.PermittingAndData@gov.bc.ca',
  subject: 'Reporting an Issue with PCNS'
};

export const GROUP_NAME_LIST = [
  { id: GroupName.ADMIN, text: 'groupName.admin' },
  { id: GroupName.NAVIGATOR, text: 'groupName.navigator' },
  { id: GroupName.NAVIGATOR_READ_ONLY, text: 'groupName.navigatorReadOnly' },
  { id: GroupName.PROPONENT, text: 'groupName.proponent' },
  { id: GroupName.SUPERVISOR, text: 'groupName.supervisor' }
];

export const MANAGED_GROUP_NAME_LIST = [
  { id: GroupName.ADMIN, text: 'groupName.admin' },
  { id: GroupName.NAVIGATOR, text: 'groupName.navigator' },
  { id: GroupName.NAVIGATOR_READ_ONLY, text: 'groupName.navigatorReadOnly' },
  { id: GroupName.SUPERVISOR, text: 'groupName.supervisor' }
];

export const MIN_SEARCH_INPUT_LENGTH = 3;

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

export const UUID_V4_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

export const YES_NO_LIST = [BasicResponse.YES, BasicResponse.NO];
export const YES_NO_UNSURE_LIST = [BasicResponse.YES, BasicResponse.NO, BasicResponse.UNSURE];
