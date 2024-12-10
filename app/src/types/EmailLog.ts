import { IStamps } from '../interfaces/IStamps';

export type EmailLog = {
  emailId?: string; // Primary Key
  httpStatus: number;
  msgId?: string;
  to?: string;
  txId?: string;
} & Partial<IStamps>;
