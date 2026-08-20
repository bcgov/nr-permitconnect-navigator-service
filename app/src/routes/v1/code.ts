import express from 'express';

import { listCodeTablesController } from '#src/controllers/code';

const router = express.Router();

/** Get all code tables */
router.get('/', listCodeTablesController);

export default router;
