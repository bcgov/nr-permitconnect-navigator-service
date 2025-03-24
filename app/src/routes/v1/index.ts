import express from 'express';

import { currentContext } from '../../middleware/authentication';

import accessRequest from './accessRequest';
import ats from './ats';
import contact from './contact';
import docs from './docs';
import document from './document';
import enquiry from './enquiry';
import housingProject from './housingProject';
import map from './map';
import note from './note';
import permit from './permit';
import reporting from './reporting';
import roadmap from './roadmap';
import sso from './sso';
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
      '/contact',
      '/docs',
      '/document',
      '/enquiry',
      '/map',
      '/note',
      '/permit',
      '/reporting',
      '/roadmap',
      '/sso',
      '/housingProject',
      '/user',
      '/yars'
    ]
  });
});

router.use('/accessRequest', accessRequest);
router.use('/docs', docs);
router.use('/ats', ats);
router.use('/contact', contact);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/map', map);
router.use('/note', note);
router.use('/permit', permit);
router.use('/reporting', reporting);
router.use('/roadmap', roadmap);
router.use('/sso', sso);
router.use('/housingProject', housingProject);
router.use('/user', user);
router.use('/yars', yars);

export default router;
