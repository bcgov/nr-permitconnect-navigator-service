import type { IStamps } from '@/interfaces';

export type PermitType = {
  permitTypeId: number; // Primary Key
  agency: string;
  branch: string;
  businessDomain: string;
  division: string;
  family?: string;
  infoUrl?: string;
  name: string;
  nameSubtype?: string;
  acronym?: string;
  trackedInAts?: boolean;
  sourceSystem: string;
  sourceSystemAcronym: string;
  trackedInATS?: boolean;
  type: string;
} & Partial<IStamps>;
