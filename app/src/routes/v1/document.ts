import express from 'express';

import {
  createDocumentController,
  deleteDocumentController,
  listDocumentsController
} from '../../controllers/document';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { documentValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

router.put(
  '/',
  hasAuthorization(Resource.DOCUMENT, Action.CREATE),
  documentValidator.createDocument,
  createDocumentController
);

router.delete(
  '/:documentId',
  hasAuthorization(Resource.DOCUMENT, Action.DELETE),
  hasAccess('documentId'),
  documentValidator.deleteDocument,
  deleteDocumentController
);

router.get(
  '/list/:activityId',
  hasAuthorization(Resource.DOCUMENT, Action.READ),
  documentValidator.listDocuments,
  listDocumentsController
);

export default router;
