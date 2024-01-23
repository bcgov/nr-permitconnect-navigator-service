import { IStamps } from '../interfaces/IStamps';

export type PermitType = {
  permitTypeId: number; // Primary Key
  agency: string;
  division: string;
  branch: string;
  businessDomain: string;
  type: string;
  family: string | null;
  name: string;
  nameSubtype: string | null;
  acronym: string | null;
  trackedInATS: boolean | null;
  sourceSystem: string;
  sourceSystemAcronym: string;
} & Partial<IStamps>;
