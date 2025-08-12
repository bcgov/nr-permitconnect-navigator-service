import { getSourceSystemKinds } from '../services/sourceSystemKind';

import type { Request, Response } from 'express';

export const getSourceSystemKindsController = async (req: Request, res: Response) => {
  const response = await getSourceSystemKinds();
  res.status(200).json(response);
};
