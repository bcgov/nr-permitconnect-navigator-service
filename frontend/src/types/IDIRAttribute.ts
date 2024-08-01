import type { ISSOAttribute } from '@/interfaces/ISSOAttribute';
export type IDIRAttribute = {
  idirUserGuid: string;
  idiUsername: string;
} & ISSOAttribute;
