import { currentUser } from '../../middleware/authentication';
import { hasAccess } from '../../middleware/authorization';
import express from 'express';
import chefs from './chefs';
import document from './document';
import note from './note';
import permit from './permit';
import user from './user';

const router = express.Router();
router.use(currentUser);
router.use(hasAccess);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/chefs', '/document', '/note', '/permit', '/user']
  });
});

router.use('/chefs', chefs);
router.use('/document', document);
router.use('/note', note);
router.use('/permit', permit);
router.use('/user', user);

export default router;
