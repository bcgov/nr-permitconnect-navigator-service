import express from 'express';
import { noteController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { noteValidator } from '../../validators';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Note create endpoint
router.put('/', noteValidator.createNote, (req: Request, res: Response, next: NextFunction): void => {
  noteController.createNote(req, res, next);
});

router.put('/:noteId', noteValidator.createNote, (req: Request, res: Response, next: NextFunction): void => {
  noteController.updateNote(req, res, next);
});

router.get('/bringForward', (req: Request, res: Response, next: NextFunction): void => {
  noteController.listBringForward(req, res, next);
});

// Note list by activity endpoint
router.get('/list/:activityId', noteValidator.listNotes, (req: Request, res: Response, next: NextFunction): void => {
  noteController.listNotes(req, res, next);
});

export default router;
