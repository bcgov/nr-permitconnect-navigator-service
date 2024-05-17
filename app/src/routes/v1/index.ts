import { currentUser } from '../../middleware/authentication';
import { hasAccess } from '../../middleware/authorization';
import express from 'express';
import submission from './submission';
import document from './document';
import enquiry from './enquiry';
import note from './note';
import permit from './permit';
import roadmap from './roadmap';
import user from './user';

const router = express.Router();
router.use(currentUser);
router.use(hasAccess);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: ['/document', '/enquiry', '/note', '/permit', '/roadmap', '/submission', '/user']
  });
});

router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/note', note);
router.use('/permit', permit);
router.use('/roadmap', roadmap);
router.use('/submission', submission);
router.use('/user', user);

export default router;
