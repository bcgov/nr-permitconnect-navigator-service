import type { ISsoAttribute } from '@/interfaces';

export interface BasicBceidAttribute extends ISsoAttribute {
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

export interface IdirAttribute extends ISsoAttribute {
  idirUserGuid: string;
  idirUsername: string;
}

export interface IdirSearchParameters {
  firstName?: string;
  lastName?: string;
  email?: string;
}
