import { IStamps } from '../interfaces/IStamps';

export type User = {
  userId?: string;
  identityId: string;
  idp?: string;
  username: string;
  email?: string;
  firstName?: string;
  fullName?: string;
  lastName?: string;
  active?: boolean;
} & IStamps;
