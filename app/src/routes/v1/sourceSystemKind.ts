import express from 'express';

import { listSourceSystemKindsController } from '#src/controllers/sourceSystemKind';

const router = express.Router();

/* Get all source system kind table data */
router.get('/', listSourceSystemKindsController);

export default router;
