import express from 'express';

import { listAllCodeTablesController } from '../../controllers/code.ts';

const router = express.Router();

/** Get all code tables */
router.get('/', listAllCodeTablesController);

export default router;
