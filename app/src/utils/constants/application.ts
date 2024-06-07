import { AccessRole, BasicResponse } from '../enums/application';

export const ACCESS_ROLES_LIST = [
  AccessRole.PCNS_ADMIN,
  AccessRole.PCNS_DEVELOPER,
  AccessRole.PCNS_NAVIGATOR,
  AccessRole.PCNS_PROPONENT,
  AccessRole.PCNS_SUPERVISOR
];

/** Default CORS settings used across the entire application */
export const DEFAULTCORS = Object.freeze({
  /** Tells browsers to cache preflight requests for Access-Control-Max-Age seconds */
  maxAge: 600,
  /** Set true to dynamically set Access-Control-Allow-Origin based on Origin */
  origin: true
});

export const YES_NO_LIST = [BasicResponse.YES, BasicResponse.NO];

export const YES_NO_UNSURE_LIST = [BasicResponse.YES, BasicResponse.NO, BasicResponse.UNSURE];
