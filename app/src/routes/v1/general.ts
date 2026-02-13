import express from 'express';

import { currentContext } from '../../middleware/authentication.ts';
import { Initiative } from '../../utils/enums/application.ts';

import accessRequest from './accessRequest.ts';
import document from './document.ts';
import enquiry from './enquiry.ts';
import generalProject from './generalProject.ts';
import map from './map.ts';
import noteHistory from './noteHistory.ts';
import permit from './permit.ts';
import roadmap from './roadmap.ts';

const router = express.Router();
router.use(currentContext(Initiative.HOUSING));

// Base v1 Responder
router.get('/general', (_req, res) => {
  res.status(200).json({
    endpoints: ['/accessRequest', '/document', '/enquiry', '/project', '/map', '/note', '/permit', '/roadmap']
  });
});

router.use('/accessRequest', accessRequest);
router.use('/document', document);
router.use('/enquiry', enquiry);
router.use('/project', generalProject);
router.use('/map', map);
router.use('/note', noteHistory);
router.use('/permit', permit);
router.use('/roadmap', roadmap);

export default router;
