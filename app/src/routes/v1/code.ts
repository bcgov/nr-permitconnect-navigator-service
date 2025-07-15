import express from 'express';

import { listAllCodeTablesController } from '../../controllers/code';

const router = express.Router();

/* GET all code tables */
router.get('/', listAllCodeTablesController);

export default router;
