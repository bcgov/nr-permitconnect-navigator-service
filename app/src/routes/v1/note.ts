import express from 'express';

import { noteController } from '../../controllers/index.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { noteValidator } from '../../validators/index.ts';

import type { NextFunction, Request, Response } from 'express';
import type { Note } from '../../types/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Note create endpoint
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteValidator.createNote,
  (req: Request<never, never, Note>, res: Response, next: NextFunction): void => {
    noteController.createNote(req, res, next);
  }
);

router.put(
  '/:noteId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteId'),
  noteValidator.updateNote,
  (req: Request<never, never, Note>, res: Response, next: NextFunction): void => {
    noteController.updateNote(req, res, next);
  }
);

// Note delete endpoint
router.delete(
  '/:noteId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  hasAccess('noteId'),
  (req: Request<{ noteId: string }>, res: Response, next: NextFunction): void => {
    noteController.deleteNote(req, res, next);
  }
);

router.get(
  '/bringForward',
  hasAuthorization(Resource.NOTE, Action.READ),
  (req: Request<never, never, never, { bringForwardState?: string }>, res: Response, next: NextFunction): void => {
    noteController.listBringForward(req, res, next);
  }
);

// Note list endpoints
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteValidator.listNotes,
  (req: Request<{ activityId: string }>, res: Response, next: NextFunction): void => {
    noteController.listNotes(req, res, next);
  }
);

export default router;
