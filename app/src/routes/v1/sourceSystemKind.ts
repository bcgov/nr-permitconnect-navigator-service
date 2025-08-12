import express from 'express';

import { getSourceSystemKindsController } from '../../controllers/sourceSystemKind';

const router = express.Router();

/* GET all source system kind table data */
router.get('/', getSourceSystemKindsController);

export default router;
