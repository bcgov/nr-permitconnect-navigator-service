import { getPeachSummaryService } from '#src/services/peach';

import type { Request, Response } from 'express';
import type { GetPeachSummaryRequest, PermitTracking } from '#types';
/**
 * Fetches PEACH data for permit tracking
 * @param req Express Request object
 * @param res Express Response object
 */
export const getPeachSummaryController = async (
  req: Request<never, never, GetPeachSummaryRequest, never>,
  res: Response
) => {
  const response = await getPeachSummaryService(req.body.permitTrackings as PermitTracking[]);
  res.status(200).json(response);
};
