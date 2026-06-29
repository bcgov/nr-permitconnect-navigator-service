import { getPeachSummaryService } from '../services/peach.ts';

import type { Request, Response } from 'express';
import type { PermitTracking } from '../types/index.ts';
/**
 * Fetches PEACH data for permit tracking
 * @param req Express Request object
 * @param res Express Response object
 */
export const getPeachSummaryController = async (req: Request<never, never, PermitTracking[], never>, res: Response) => {
  const response = getPeachSummaryService(req.body);
  res.status(200).json(response);
};
