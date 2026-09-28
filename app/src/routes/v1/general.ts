import express from 'express';

import createAccessRequestRouter from './accessRequest.ts';
import createDocumentRouter from './document.ts';
import createEnquiryRouter from './enquiry.ts';
import generalProject from './generalProject.ts';
import createMapRouter from './map.ts';
import createNoteHistoryRouter from './noteHistory.ts';
import createPermitRouter from './permit.ts';
import createRoadmapRouter from './roadmap.ts';
import { hasAuthentication } from '#src/middleware/authentication';
import { Initiative } from '#src/utils/enums/application';

const router = express.Router();
router.use(hasAuthentication(Initiative.GENERAL));

router.use('/access-request', createAccessRequestRouter('/general/access-request', 'General'));
router.use('/document', createDocumentRouter('/general/document', 'General'));
router.use('/enquiry', createEnquiryRouter('/general/enquiry', 'General'));
router.use('/project', generalProject);
router.use('/map', createMapRouter('/general/map', 'General'));
router.use('/note', createNoteHistoryRouter('/general/note', 'General'));
router.use('/permit', createPermitRouter('/general/permit', 'General'));
router.use('/roadmap', createRoadmapRouter('/general/roadmap', 'General'));

export default router;
