import { currentUser } from '../../middleware/authentication';

import express from 'express';

import accessRequest from './accessRequest';
import document from './document';
import enquiry from './enquiry';
import note from './note';
import permit from './permit';
import roadmap from './roadmap';
import sso from './sso';
import submission from './submission';
import user from './user';

const router = express.Router();
router.use(currentUser);

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/accessRequest',
      '/document',
      '/enquiry',
      '/note',
      '/permit',
      '/roadmap',
      '/sso',
      '/submission',
      '/user'
    ]
  });
});

router.use('/accessRequest', accessRequest);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/note', note);
router.use('/permit', permit);
router.use('/roadmap', roadmap);
router.use('/sso', sso);
router.use('/submission', submission);
router.use('/user', user);

export default router;
