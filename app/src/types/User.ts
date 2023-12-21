import { IStamps } from '../interfaces/IStamps';

export type User = {
  userId?: string; // Primary Key
  identityId: string;
  idp: string | null;
  username: string;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
  lastName: string | null;
  active: boolean;
} & Partial<IStamps>;
