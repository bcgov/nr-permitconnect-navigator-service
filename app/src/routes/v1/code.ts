import express from 'express';

import { codeController } from '../../controllers';

const router = express.Router();

/* GET all code tables */
router.get('/', codeController.listAllCodeTables);

export default router;
