import Joi from 'joi';
import { emailJoi, phoneNumberJoi, stringRequiredMaxLengthTrim } from './common';

export const applicantSchema = Joi.object({
  contactPreference: stringRequiredMaxLengthTrim,
  email: emailJoi.required(),
  firstName: stringRequiredMaxLengthTrim,
  lastName: stringRequiredMaxLengthTrim,
  phoneNumber: phoneNumberJoi.required(),
  relationshipToProject: stringRequiredMaxLengthTrim
});
