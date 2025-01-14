import { IStamps } from '../interfaces/IStamps.ts';

export type User = {
  userId?: string; // Primary Key
  identityId: string;
  idp: string | null;
  sub: string;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
  lastName: string | null;
  active: boolean;
} & Partial<IStamps>;
