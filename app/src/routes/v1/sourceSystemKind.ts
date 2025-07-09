import express from 'express';

import { sourceSystemKindController } from '../../controllers';

const router = express.Router();

/* GET all source system kind table data */
router.get('/', sourceSystemKindController.getSourceSystemkinds);

export default router;
