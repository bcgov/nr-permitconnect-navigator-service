import express from 'express';

import {
  createNoteHistoryController,
  deleteNoteHistoryController,
  listBringForwardController,
  listNoteHistoryController,
  updateNoteHistoryController
} from '../../controllers/noteHistory';
import { hasAccess, hasAuthorization } from '../../middleware/authorization';
import { requireSomeAuth } from '../../middleware/requireSomeAuth';
import { requireSomeGroup } from '../../middleware/requireSomeGroup';
import { Action, Resource } from '../../utils/enums/application';
import { noteHistoryValidator } from '../../validators';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

// Note History create endpoint
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteHistoryValidator.createNoteHistory,
  createNoteHistoryController
);

// Note History update endpoint
router.put(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteHistoryId'),
  noteHistoryValidator.updateNoteHistory,
  updateNoteHistoryController
);

// Note History delete endpoint
router.delete(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  hasAccess('noteHistoryId'),
  deleteNoteHistoryController
);

// Note History list bring forward endpoint
router.get('/bringForward', hasAuthorization(Resource.NOTE, Action.READ), listBringForwardController);

// Note History list general endpoint
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteHistoryValidator.listNoteHistory,
  listNoteHistoryController
);

export default router;
