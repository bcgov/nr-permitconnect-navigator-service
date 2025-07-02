import express from 'express';

import { noteController } from '../../controllers';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { noteValidator } from '../../validators';

import type { NextFunction, Request, Response } from 'express';
import type { Note, NoteHistory } from '../../types';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Note History create endpoint
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteValidator.createNoteHistory,
  (req: Request<never, never, { noteHistory: NoteHistory; note: Note }>, res: Response, next: NextFunction): void => {
    noteController.createNoteHistory(req, res, next);
  }
);

// Note add endpoint
router.put(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteHistoryId'),
  noteValidator.addNote,
  (req: Request<never, never, Note>, res: Response, next: NextFunction): void => {
    noteController.addNote(req, res, next);
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

router.get(
  '/bringForward',
  hasAuthorization(Resource.NOTE, Action.READ),
  (req: Request<never, never, never, { bringForwardState?: string }>, res: Response, next: NextFunction): void => {
    noteController.listBringForward(req, res, next);
  }
);

// Note History list endpoint
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteValidator.listNoteHistory,
  (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
    noteController.listNoteHistory(req, res, next);
  }
);

export default router;
