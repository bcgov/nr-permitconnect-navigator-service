import express from 'express';
import { noteController } from '../../controllers';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';

import type { NextFunction, Request, Response } from '../../interfaces/IExpress';

const router = express.Router();
router.use(requireSomeAuth);

// note create endpoint
router.put('/', (req: Request, res: Response, next: NextFunction): void => {
  noteController.createNote(req, res, next);
});

// note list by submission endpoint
router.get('/list/:submissionId', (req: Request, res: Response, next: NextFunction): void => {
  noteController.listNotes(req, res, next);
});

export default router;
