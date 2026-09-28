import express from 'express';

import createAccessRequestRouter from './accessRequest.ts';
import createDocumentRouter from './document.ts';
import createEnquiryRouter from './enquiry.ts';
import housingProject from './housingProject.ts';
import createMapRouter from './map.ts';
import createNoteHistoryRouter from './noteHistory.ts';
import createPermitRouter from './permit.ts';
import createRoadmapRouter from './roadmap.ts';
import { hasAuthentication } from '#src/middleware/authentication';
import { Initiative } from '#src/utils/enums/application';

const router = express.Router();
router.use(hasAuthentication(Initiative.HOUSING));

router.use('/access-request', createAccessRequestRouter('/housing/access-request', 'Housing'));
router.use('/document', createDocumentRouter('/housing/document', 'Housing'));
router.use('/enquiry', createEnquiryRouter('/housing/enquiry', 'Housing'));
router.use('/project', housingProject);
router.use('/map', createMapRouter('/housing/map', 'Housing'));
router.use('/note', createNoteHistoryRouter('/housing/note', 'Housing'));
router.use('/permit', createPermitRouter('/housing/permit', 'Housing'));
router.use('/roadmap', createRoadmapRouter('/housing/roadmap', 'Housing'));

export default router;
