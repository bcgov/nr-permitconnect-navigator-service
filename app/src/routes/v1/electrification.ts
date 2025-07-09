import express from 'express';

import { currentContext } from '../../middleware/authentication';
import { Initiative } from '../../utils/enums/application';

import accessRequest from './accessRequest';
import document from './document';
import electrificationProject from './electrificationProject';
import enquiry from './enquiry';
import noteHistory from './noteHistory';
import permit from './permit';
import roadmap from './roadmap';

const router = express.Router();
router.use(currentContext(Initiative.ELECTRIFICATION));

// Base v1 Responder
router.get('/electrification', (_req, res) => {
  res.status(200).json({
    endpoints: ['/accessRequest', '/document', '/project', '/enquiry', '/note', '/permit', '/roadmap']
  });
});

router.use('/accessRequest', accessRequest);
router.use('/document', document);
router.use('/project', electrificationProject);
router.use('/enquiry', enquiry);
router.use('/note', noteHistory);
router.use('/permit', permit);
router.use('/roadmap', roadmap);

export default router;
