import type { IStamps } from '@/interfaces';

export type PermitType = {
  permitTypeId: number; // Primary Key
  acronym?: string;
  agency: string;
  branch: string;
  businessDomain: string;
  division: string;
  family?: string;
  infoUrl?: string;
  name: string;
  nameSubtype?: string;
  sourceSystem: string;
  sourceSystemAcronym: string;
  trackedInATS?: boolean;
  type: string;
} & Partial<IStamps>;
