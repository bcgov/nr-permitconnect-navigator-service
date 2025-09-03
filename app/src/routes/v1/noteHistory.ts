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

/** Create a note history */
router.put(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteHistoryValidator.createNoteHistory,
  createNoteHistoryController
);

/** Update a note history */
router.put(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteHistoryId'),
  noteHistoryValidator.updateNoteHistory,
  updateNoteHistoryController
);

/** Delete a note history */
router.delete(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  hasAccess('noteHistoryId'),
  deleteNoteHistoryController
);

/** Get a list of bring forward note histories */
router.get('/bringForward', hasAuthorization(Resource.NOTE, Action.READ), listBringForwardController);

/** Get a list of note histories */
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteHistoryValidator.listNoteHistory,
  listNoteHistoryController
);

export default router;
