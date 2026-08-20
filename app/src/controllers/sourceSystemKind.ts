import { listSourceSystemKindsService } from '#src/services/sourceSystemKind';

import type { Request, Response } from 'express';

export const listSourceSystemKindsController = async (req: Request, res: Response) => {
  const response = await listSourceSystemKindsService();
  res.status(200).json(response);
};
