import express from 'express';

import createAccessRequestRouter from './accessRequest.ts';
import createDocumentRouter from './document.ts';
import electrificationProject from './electrificationProject.ts';
import createEnquiryRouter from './enquiry.ts';
import createNoteHistoryRouter from './noteHistory.ts';
import createPermitRouter from './permit.ts';
import createRoadmapRouter from './roadmap.ts';
import { hasAuthentication } from '#src/middleware/authentication';
import { Initiative } from '#src/utils/enums/application';

const router = express.Router();
router.use(hasAuthentication(Initiative.ELECTRIFICATION));

router.use('/access-request', createAccessRequestRouter('/electrification/access-request', 'Electrification'));
router.use('/document', createDocumentRouter('/electrification/document', 'Electrification'));
router.use('/project', electrificationProject);
router.use('/enquiry', createEnquiryRouter('/electrification/enquiry', 'Electrification'));
router.use('/note', createNoteHistoryRouter('/electrification/note', 'Electrification'));
router.use('/permit', createPermitRouter('/electrification/permit', 'Electrification'));
router.use('/roadmap', createRoadmapRouter('/electrification/roadmap', 'Electrification'));

export default router;
