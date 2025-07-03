import express from 'express';

import { noteController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { BringForwardType } from '../../utils/enums/projectCommon';
import { noteValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { NoteHistory } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Note History create endpoint
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteValidator.createNoteHistory,
  (req: Request<never, never, NoteHistory & { note: string }>, res: Response, next: NextFunction): void => {
    noteController.createNoteHistory(req, res, next);
  }
);

// Note add endpoint
router.put(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteHistoryId'),
  noteValidator.updateNoteHistory,
  (
    req: Request<{ noteHistoryId: string }, never, NoteHistory & { note: string | undefined }>,
    res: Response,
    next: NextFunction
  ): void => {
    noteController.updateNoteHistory(req, res, next);
  }
);

// Note History delete endpoint
router.delete(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  hasAccess('noteHistoryId'),
  (req: Request<{ noteHistoryId: string }>, res: Response, next: NextFunction): void => {
    noteController.deleteNoteHistory(req, res, next);
  }
);

// Note History list bring forward endpoint
router.get(
  '/bringForward',
  hasAuthorization(Resource.NOTE, Action.READ),
  (
    req: Request<never, never, never, { bringForwardState?: BringForwardType }>,
    res: Response,
    next: NextFunction
  ): void => {
    noteController.listBringForward(req, res, next);
  }
);

// Note History list general endpoint
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteValidator.listNoteHistory,
  (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
    noteController.listNoteHistory(req, res, next);
  }
);

export default router;
