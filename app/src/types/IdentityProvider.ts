import { IStamps } from '../interfaces/IStamps.ts';

export type IdentityProvider = {
  idp: string; // Primary Key
  active: boolean;
} & Partial<IStamps>;
