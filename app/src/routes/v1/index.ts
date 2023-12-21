import { currentUser } from '../../middleware/authentication';
import express from 'express';
import chefs from './chefs';
import user from './user';

const router = express.Router();
router.use(currentUser);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/chefs', '/user']
  });
});

/** CHEFS Router */
router.use('/chefs', chefs);
router.use('/user', user);

export default router;
