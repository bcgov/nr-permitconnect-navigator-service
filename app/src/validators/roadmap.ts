// import Joi from 'joi';

// import { activityId } from './common';
import { validate } from '../middleware/validation';

const schema = {
  update: {
    // params: Joi.object({
    //   activityId: activityId
    // })
    // body: Joi.object({})
  }
};

export default {
  update: validate(schema.update)
};
