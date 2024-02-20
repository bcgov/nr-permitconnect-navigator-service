import { IStamps } from '../interfaces/IStamps';

export type PermitType = {
  permitTypeId: number; // Primary Key
  agency: string;
  division: string | null;
  branch: string | null;
  businessDomain: string;
  type: string;
  family: string | null;
  name: string;
  nameSubtype: string | null;
  acronym: string | null;
  trackedInATS: boolean;
  sourceSystem: string | null;
  sourceSystemAcronym: string;
} & Partial<IStamps>;
