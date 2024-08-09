import express from 'express';

import { noteController } from '../../controllers';
import { hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { Action, Resource } from '../../utils/enums/application';
import { noteValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Note create endpoint
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteValidator.createNote,
  (req: Request, res: Response, next: NextFunction): void => {
    noteController.createNote(req, res, next);
  }
);

router.put(
  '/:noteId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  noteValidator.updateNote,
  (req: Request, res: Response, next: NextFunction): void => {
    noteController.updateNote(req, res, next);
  }
);

// Note delete endpoint
router.delete(
  '/:noteId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  (req: Request, res: Response, next: NextFunction): void => {
    noteController.deleteNote(req, res, next);
  }
);

router.get(
  '/bringForward',
  hasAuthorization(Resource.NOTE, Action.READ),
  (req: Request, res: Response, next: NextFunction): void => {
    noteController.listBringForward(req, res, next);
  }
);

// Note list endpoints
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteValidator.listNotes,
  (req: Request, res: Response, next: NextFunction): void => {
    noteController.listNotes(req, res, next);
  }
);

export default router;
