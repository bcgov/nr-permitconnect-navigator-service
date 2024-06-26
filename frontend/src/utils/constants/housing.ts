/*
 * Housing initiative constants
 */
import icon from '@/assets/images/marker-icon-red.png';
import iconShadow from '@/assets/images/marker-shadow.png';
import {
  ApplicationStatus,
  BringForwardType,
  ContactPreference,
  IntakeStatus,
  NoteType,
  NumResidentialUnits,
  PermitAuthorizationStatus,
  PermitNeeded,
  PermitStatus,
  ProjectLocation,
  ProjectRelationship,
  SubmissionType
} from '../enums/housing';

import type { BaseIconOptions, LatLngExpression } from 'leaflet';

export const ADDRESS_CODER_QUERY_PARAMS = {
  echo: false,
  brief: false,
  minScore: 55,
  onlyCivic: true,
  maxResults: 15,
  autoComplete: true,
  matchAccuracy: 100,
  matchPrecision: 'occupant, unit, site, civic_number, intersection, block, street, locality, province',
  precisionPoints: 100
};

export const APPLICATION_STATUS_LIST = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_PROGRESS,
  ApplicationStatus.DELAYED,
  ApplicationStatus.COMPLETED
];

export const BRING_FORWARD_TYPE_LIST = [BringForwardType.UNRESOLVED, BringForwardType.RESOLVED];

export const CONTACT_PREFERENCE_LIST = [
  ContactPreference.PHONE_CALL,
  ContactPreference.EMAIL,
  ContactPreference.EITHER
];

export const ENQUIRY_TYPE_LIST = [
  SubmissionType.GENERAL_ENQUIRY,
  SubmissionType.STATUS_REQUEST,
  SubmissionType.ESCALATION,
  SubmissionType.INAPPLICABLE
];

export const HOUSING_CONTACT = {
  email: 'Housing.Authorizations@gov.bc.ca',
  subject: 'Assistance with Permit Connect Navigator Service'
};

export const INTAKE_STATUS_LIST = [IntakeStatus.SUBMITTED, IntakeStatus.ASSIGNED, IntakeStatus.COMPLETED];

export const NOTE_TYPE_LIST = [NoteType.GENERAL, NoteType.BRING_FORWARD, NoteType.ENQUIRY, NoteType.ROADMAP];

export const NUM_RESIDENTIAL_UNITS_LIST = [
  NumResidentialUnits.ONE_TO_NINE,
  NumResidentialUnits.TEN_TO_FOURTY_NINE,
  NumResidentialUnits.FIFTY_TO_FIVE_HUNDRED,
  NumResidentialUnits.GREATER_THAN_FIVE_HUNDRED,
  NumResidentialUnits.UNSURE
];

export const ORG_BOOK_QUERY_PARAMS = {
  limit: 100,
  skip: 0,
  latest: true,
  inactive: false,
  revoked: false
};

export const PROJECT_RELATIONSHIP_LIST = [
  ProjectRelationship.OWNER,
  ProjectRelationship.EMPLOYEE,
  ProjectRelationship.AGENT,
  ProjectRelationship.CONSULTANT,
  ProjectRelationship.OTHER
];

export const PERMIT_AUTHORIZATION_STATUS_LIST = [
  PermitAuthorizationStatus.ISSUED,
  PermitAuthorizationStatus.DENIED,
  PermitAuthorizationStatus.PENDING,
  PermitAuthorizationStatus.IN_REVIEW,
  PermitAuthorizationStatus.NONE
];

export const PERMIT_NEEDED_LIST = [PermitNeeded.YES, PermitNeeded.UNDER_INVESTIGATION, PermitNeeded.NO];

export const PERMIT_STATUS_LIST = [PermitStatus.NEW, PermitStatus.APPLIED, PermitStatus.COMPLETED];

export const PROJECT_LOCATION_LIST = [ProjectLocation.LOCATION_COORDINATES, ProjectLocation.STREET_ADDRESS];

export const QUEUE_PRIORITY = [1, 2, 3];

export const SUBMISSION_TYPE_LIST = [SubmissionType.GUIDANCE, SubmissionType.INAPPLICABLE];

/*
 * Mapping constants
 */
export const MAP_ICON_OPTIONS_RED: BaseIconOptions = {
  iconUrl: icon, //'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: iconShadow, //'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
};

export const OSM_URL_TEMPLATE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const OSM_TILE_LAYER_OPTIONS = {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
};

// Lat/Long for Victoria
export const MAP_INITIAL_START_POINT: { center: LatLngExpression; zoom: number } = {
  center: [48.428, -123.365],
  zoom: 13
};

export const BC_BOUNDARIES_LOWER: LatLngExpression = [44, -140];
export const BC_BOUNDARIES_UPPER: LatLngExpression = [63, -109];
