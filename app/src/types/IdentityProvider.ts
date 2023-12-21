import { IStamps } from '../interfaces/IStamps';

export type IdentityProvider = {
  idp: string; // Primary Key
  active: boolean;
} & Partial<IStamps>;
