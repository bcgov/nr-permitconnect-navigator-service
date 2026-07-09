import express from 'express';

import { listSourceSystemKindsController } from '../../controllers/sourceSystemKind.ts';

const router = express.Router();

/* Get all source system kind table data */
router.get('/', listSourceSystemKindsController);

export default router;
