import Joi from 'joi';

import { uuidv4 } from './common.ts';
import { validate } from '../middleware/validation.ts';
import { createStamps } from './stamps.ts';

export const sharedPermitNoteSchema = {
  permitId: uuidv4.allow(null),
  permitNoteId: uuidv4.allow(null),
  note: Joi.string().required(),
  ...createStamps
};

const schema = {
  createPermitNote: {
    body: Joi.object(sharedPermitNoteSchema)
  },
  listPermitNotes: {
    params: Joi.object({
      permitId: uuidv4.required()
    })
  }
  // TODO impliment update & delete validators
  // updatePermitNote: {
  //   body: Joi.object({
  //     ...sharedPermitSchema,
  //     permitNoteId: uuidv4.required()
  //   }),
  //   query: Joi.object({
  //     permitId: uuidv4.required()
  //   })
  // },
  // deletePermitNote: {
  //   query: Joi.object({
  //     permitId: uuidv4.required()
  //   })
  // },
};

export default {
  createPermitNote: validate(schema.createPermitNote),
  listPermitNotes: validate(schema.listPermitNotes)
  // deletePermit: validate(schema.deletePermit),
  // updatePermit: validate(schema.updatePermit)
};
