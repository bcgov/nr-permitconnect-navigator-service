import { addMethod, string } from 'yup';

addMethod(string, 'emptyToNull', function () {
  return this.transform((value) => (value === '' ? null : value));
});
