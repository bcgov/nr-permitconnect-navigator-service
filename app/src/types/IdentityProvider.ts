import { IStamps } from '../interfaces/IStamps';

export type IdentityProvider = {
  idp: string;
  active: boolean;
} & Partial<IStamps>;
