import Joi from 'joi';

import { activityId, uuidv4 } from './common';
import { validate } from '../middleware/validation';

const schema = {
  createDocument: {
    body: Joi.object({
      activityId: activityId,
      documentId: uuidv4.required(),
      filename: Joi.string().max(255).required(),
      mimeType: Joi.string().min(0).max(255),
      filesize: Joi.number().required()
    })
  },
  deleteDocument: {
    params: Joi.object({
      documentId: Joi.string().max(255).required()
    })
  },
  listDocuments: {
    params: Joi.object({
      activityId: activityId
    })
  }
};

export default {
  createDocument: validate(schema.createDocument),
  deleteDocument: validate(schema.deleteDocument),
  listDocuments: validate(schema.listDocuments)
};
