import express from 'express';

import { getSourceSystemKindsController } from '../../controllers/sourceSystemKind.ts';

const router = express.Router();

/* Get all source system kind table data */
router.get('/', getSourceSystemKindsController);

export default router;
