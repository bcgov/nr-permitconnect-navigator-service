import express from 'express';

import {
  createNoteHistoryController,
  deleteNoteHistoryController,
  listBringForwardsController,
  listNoteHistoriesController,
  patchNoteHistoryController
} from '#src/controllers/noteHistory';
import { hasAccess, hasAuthorization } from '#src/middleware/authorization';
import { requireSomeAuth } from '#src/middleware/requireSomeAuth';
import { requireSomeGroup } from '#src/middleware/requireSomeGroup';
import { Action, Resource } from '#src/utils/enums/application';
import { noteHistoryValidator } from '#src/validators/index';

const router = express.Router();
router.use(requireSomeAuth);
router.use(requireSomeGroup);

/** Create a note history */
router.post(
  '/',
  hasAuthorization(Resource.NOTE, Action.CREATE),
  noteHistoryValidator.createNoteHistory,
  createNoteHistoryController
);

/** Patch a note history */
router.patch(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.UPDATE),
  hasAccess('noteHistoryId'),
  noteHistoryValidator.patchNoteHistory,
  patchNoteHistoryController
);

/** Delete a note history */
router.delete(
  '/:noteHistoryId',
  hasAuthorization(Resource.NOTE, Action.DELETE),
  hasAccess('noteHistoryId'),
  deleteNoteHistoryController
);

/** Get a list of bring forward note histories */
router.get('/bring-forward', hasAuthorization(Resource.NOTE, Action.READ), listBringForwardsController);

/** Get a list of note histories */
router.get(
  '/list/:activityId',
  hasAuthorization(Resource.NOTE, Action.READ),
  noteHistoryValidator.listNoteHistory,
  listNoteHistoriesController
);

export default router;
