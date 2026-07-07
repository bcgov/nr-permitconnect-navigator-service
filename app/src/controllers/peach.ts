import { getPeachSummaryService } from '#src/services/peach';

import type { Request, Response } from 'express';
import type { PermitTracking } from '#types';

/**
 * Fetches PEACH data for permit tracking
 * @param req Express Request object
 * @param res Express Response object
 */
export const getPeachSummaryController = async (
  req: Request<never, never, { permitTrackings: PermitTracking[] }, never>,
  res: Response
) => {
  const response = await getPeachSummaryService(req.body.permitTrackings);
  res.status(200).json(response);
};
