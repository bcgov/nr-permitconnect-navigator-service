import express from 'express';

import { listCodeTablesController } from '../../controllers/code.ts';

const router = express.Router();

/** Get all code tables */
router.get('/', listCodeTablesController);

export default router;
