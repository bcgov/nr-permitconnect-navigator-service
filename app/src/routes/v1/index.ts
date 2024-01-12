import { currentUser } from '../../middleware/authentication';
import express from 'express';
import chefs from './chefs';
import document from './document';
import user from './user';

const router = express.Router();
router.use(currentUser);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/chefs', '/user']
  });
});

router.use('/chefs', chefs);
router.use('/document', document);
router.use('/user', user);

export default router;
