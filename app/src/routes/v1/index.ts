import express from 'express';

import { currentContext } from '../../middleware/authentication';

import accessRequest from './accessRequest';
import ats from './ats';
import docs from './docs';
import document from './document';
import enquiry from './enquiry';
import note from './note';
import permit from './permit';
import roadmap from './roadmap';
import sso from './sso';
import submission from './submission';
import user from './user';
import yars from './yars';

import { Initiative } from '../../utils/enums/application';

const router = express.Router();
router.use(currentContext(Initiative.HOUSING));

// Base v1 Responder
router.get('/', (_req, res) => {
  res.status(200).json({
    endpoints: [
      '/accessRequest',
      '/ats',
      '/docs',
      '/document',
      '/enquiry',
      '/note',
      '/permit',
      '/roadmap',
      '/sso',
      '/submission',
      '/user',
      '/yars'
    ]
  });
});

router.use('/accessRequest', accessRequest);
router.use('/docs', docs);
router.use('/ats', ats);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/note', note);
router.use('/permit', permit);
router.use('/roadmap', roadmap);
router.use('/sso', sso);
router.use('/submission', submission);
router.use('/user', user);
router.use('/yars', yars);

export default router;
