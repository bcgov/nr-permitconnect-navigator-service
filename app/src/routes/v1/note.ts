import express from 'express';
import { noteController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// Note create endpoint
router.put('/', (req: Request, res: Response, next: NextFunction): void => {
  noteController.createNote(req, res, next);
});

// Note list by activity endpoint
router.get('/list/:activityId', (req: Request, res: Response, next: NextFunction): void => {
  noteController.listNotes(req, res, next);
});

export default router;
