import { currentUser } from '../../middleware/authentication';
import express from 'express';
import chefs from './chefs';

const router = express.Router();
router.use(currentUser);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/chefs']
  });
});

/** CHEFS Router */
router.use('/chefs', chefs);

export default router;
