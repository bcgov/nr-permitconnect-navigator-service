import type { ISSOAttribute } from '@/interfaces/ISSOAttribute';

export type BasicBCeIDAttribute = {
  bceidUserGuid: string;
  bceidUsername: string;
} & ISSOAttribute;
