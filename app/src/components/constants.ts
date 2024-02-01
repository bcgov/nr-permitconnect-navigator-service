/** Current user authentication type */
export const AuthType = Object.freeze({
  /** OIDC JWT Authentication header provided */
  BEARER: 'BEARER',
  /** No Authentication header provided */
  NONE: 'NONE'
});

/** Default CORS settings used across the entire application */
export const DEFAULTCORS = Object.freeze({
  /** Tells browsers to cache preflight requests for Access-Control-Max-Age seconds */
  maxAge: 600,
  /** Set true to dynamically set Access-Control-Allow-Origin based on Origin */
  origin: true
});

/** Current user authentication type */
export const IdentityProvider = Object.freeze({
  IDIR: 'idir',
  BCEID: 'bceidbasic',
  BCEIDBUSINESS: 'bceidbusiness'
});

/** CHEFS form statuses */
export const APPLICATION_STATUS_LIST = Object.freeze({
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  DELAYED: 'Delayed',
  COMPLETED: 'Completed'
});
