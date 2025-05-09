import { IStamps } from '../interfaces/IStamps';

export type User = {
  bceidBusinessName: string | null;
  userId?: string; // Primary Key
  idp: string | null;
  sub: string;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
  lastName: string | null;
  active: boolean;
} & Partial<IStamps>;
