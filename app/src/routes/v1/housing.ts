import express from 'express';

import { currentContext } from '../../middleware/authentication';
import { Initiative } from '../../utils/enums/application';

import accessRequest from './accessRequest';
import document from './document';
import enquiry from './enquiry';
import housingProject from './housingProject';
import map from './map';
import note from './note';
import permit from './permit';
import roadmap from './roadmap';

const router = express.Router();
router.use(currentContext(Initiative.HOUSING));

// Base v1 Responder
router.get('/housing', (_req, res) => {
  res.status(200).json({
    endpoints: ['/accessRequest', '/document', '/enquiry', '/project', '/map', '/note', '/permit', '/roadmap']
  });
});

router.use('/accessRequest', accessRequest);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/project', housingProject);
router.use('/map', map);
router.use('/note', note);
router.use('/permit', permit);
router.use('/roadmap', roadmap);

export default router;
