import express from 'express';

import { currentContext } from '../../middleware/authentication.ts';

import accessRequest from './accessRequest.ts';
import ats from './ats.ts';
import docs from './docs.ts';
import document from './document.ts';
import enquiry from './enquiry.ts';
import note from './note.ts';
import permit from './permit.ts';
import roadmap from './roadmap.ts';
import sso from './sso.ts';
import submission from './submission.ts';
import user from './user.ts';
import yars from './yars.ts';

import { Initiative } from '../../utils/enums/application.ts';

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
