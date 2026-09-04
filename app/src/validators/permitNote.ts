import { z } from 'zod';

import { uuidv4 } from './common.ts';
import { createStamps } from './stamps.ts';

export const sharedPermitNoteSchema = {
  permitId: uuidv4.nullish(),
  permitNoteId: uuidv4.nullish(),
  note: z.string().min(1),
  ...createStamps
};
