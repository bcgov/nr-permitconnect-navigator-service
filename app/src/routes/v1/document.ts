import express from 'express';

import {
  createDocumentController,
  deleteDocumentController,
  listDocumentsController
} from '../../controllers/document.ts';
import { hasAccess, hasAuthorization } from '../../middleware/authorization.ts';
import { requireSomeAuth } from '../../middleware/requireSomeAuth.ts';
import { requireSomeGroup } from '../../middleware/requireSomeGroup.ts';
import { Action, Resource } from '../../utils/enums/application.ts';
import { documentValidator } from '../../validators/index.ts';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Create a document */
router.post(
  '/',
  hasAuthorization(Resource.DOCUMENT, Action.CREATE),
  documentValidator.createDocument,
  createDocumentController
);

/** Delete a document */
router.delete(
  '/:documentId',
  hasAuthorization(Resource.DOCUMENT, Action.DELETE),
  hasAccess('documentId'),
  documentValidator.deleteDocument,
  deleteDocumentController
);

/** Get a list of documents */
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.DOCUMENT, Action.READ),
  documentValidator.listDocuments,
  listDocumentsController
);

export default router;
