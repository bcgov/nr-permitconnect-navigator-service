// import Joi from 'joi';

// import { activityId } from './common';
import { validate } from '../middleware/validation';

const schema = {
  send: {
    // params: Joi.object({
    //   activityId: activityId
    // })
    // body: Joi.object({})
  }
};

export default {
  send: validate(schema.send)
};
