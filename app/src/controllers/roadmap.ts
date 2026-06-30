import { getRoadmapNoteService, sendRoadmapService } from '../services/roadmap.ts';

import type { Request, Response } from 'express';
import type { Email } from '../types';

export const getRoadmapNoteController = async (
  req: Request<never, never, never, { activityId: string }>,
  res: Response
) => {
  const response = await getRoadmapNoteService(req.query.activityId);
  res.status(200).json(response);
};

export const sendRoadmapController = async (
  req: Request<never, never, { activityId: string; selectedFileIds: string[]; emailData: Email }>,
  res: Response
) => {
  const response = await sendRoadmapService(
    res.locals.currentContext,
    req.body.activityId,
    req.body.selectedFileIds,
    req.body.emailData
  );
  res.status(201).json(response);
};
