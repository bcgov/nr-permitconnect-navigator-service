import { generateCreateStamps } from '../db/utils/utils';
import { createPermitNote } from '../services/permitNote';

import type { Request, Response } from 'express';
import type { PermitNote } from '../types';

export const createPermitNoteController = async (req: Request<never, never, PermitNote>, res: Response) => {
  const response = await createPermitNote({
    ...req.body,
    ...generateCreateStamps(req.currentContext)
  });
  res.status(201).json(response);
};
