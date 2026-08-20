import express from 'express';

import { createDocumentController, deleteDocumentController, listDocumentsController } from '#src/controllers/document';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { documentValidator } from '#src/validators/index';

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
