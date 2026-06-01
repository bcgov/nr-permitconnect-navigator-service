export interface BasicBceidAttribute extends SsoAttribute {
  bceidUserGuid: string;
  bceidUsername: string;
}

export interface BceidSearchParameters {
  guid: string;
}

export interface BusinessBceidAttribute extends BasicBceidAttribute {
  bceidBusinessGuid: string;
  bceidBusinessName: string;
}

export interface IdirAttribute extends SsoAttribute {
  idirUserGuid: string;
  idirUsername: string;
}

export interface IdirSearchParameters {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface SsoAttribute {
  displayName?: string;
}
