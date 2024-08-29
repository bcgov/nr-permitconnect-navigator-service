import { currentUser } from '../../middleware/authentication';
import { expressListRoutes } from '../utils';

import express from 'express';

import activity from './activity';
import docs from './docs';
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
    endpoints: ['/activity', '/document', '/enquiry', '/note', '/permit', '/roadmap', '/sso', '/submission', '/user']
  });
});

router.use('/activity', activity);
router.use('/docs', docs);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/note', note);
router.use('/permit', permit);
router.use('/roadmap', roadmap);
router.use('/sso', sso);
router.use('/submission', submission);
router.use('/user', user);

expressListRoutes(router, { prefix: 'api/v1' });

export default router;
