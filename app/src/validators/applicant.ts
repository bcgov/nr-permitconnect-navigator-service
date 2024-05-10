import Joi from 'joi';

export const applicantSchema = Joi.object({
  contactPreference: Joi.string().max(255).required(),
  email: Joi.string().email().required(),
  firstName: Joi.string().max(255).required(),
  lastName: Joi.string().max(255).required(),
  phoneNumber: Joi.string().max(255).required(),
  relationshipToProject: Joi.string().max(255).required()
});
