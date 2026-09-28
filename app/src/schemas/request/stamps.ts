import { notInFutureDate, uuidv4 } from './common.ts';

export const createStamps = {
  createdAt: notInFutureDate('"createdAt" must be smaller than or equal to now').nullish(),
  createdBy: uuidv4.nullish(),
  updatedAt: notInFutureDate('"updatedAt" must be smaller than or equal to now').nullish(),
  updatedBy: uuidv4.nullish(),
  deletedAt: notInFutureDate('"deletedAt" must be smaller than or equal to now').nullish(),
  deletedBy: uuidv4.nullish()
};
