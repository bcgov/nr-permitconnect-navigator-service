import { IStamps } from '../interfaces/IStamps';

export type PermitType = {
  permitTypeId: number; // Primary Key
  acronym: string | null;
  agency: string;
  branch: string | null;
  businessDomain: string;
  division: string | null;
  family: string | null;
  name: string;
  nameSubtype: string | null;
  sourceSystemCode: string | null;
  trackedInATS: boolean;
  type: string;
} & Partial<IStamps>;
