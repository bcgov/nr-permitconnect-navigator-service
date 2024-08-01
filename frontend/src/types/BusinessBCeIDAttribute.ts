import type { BasicBCeIDAttribute } from '@/types';
export type BusinessBCeIDAttribute = {
  bceidBusinessGuid: string;
  bceidBusinessName: string;
} & BasicBCeIDAttribute;
