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
