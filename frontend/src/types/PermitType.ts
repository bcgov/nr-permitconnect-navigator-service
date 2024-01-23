import type { IStamps } from '@/interfaces';

export type PermitType = {
  permitTypeId: number; // Primary Key
  agency: string;
  division: string;
  branch: string;
  businessDomain: string;
  type: string;
  family?: string;
  name: string;
  nameSubtype?: string;
  acronym?: string;
  trackedInATS?: boolean;
  sourceSystem: string;
  sourceSystemAcronym: string;
} & Partial<IStamps>;
