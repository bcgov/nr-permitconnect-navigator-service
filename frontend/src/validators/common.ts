import { date, number, string } from 'yup';

import { Regex } from '@/utils/enums/application';

export const atsClientIdValidator = number().notRequired().min(0).integer().label('ATS Client #');

export const emailValidator = (message: string) => string().matches(new RegExp(Regex.EMAIL), message);

export const latitudeValidator = number().notRequired().min(48).max(60).label('Latitude');

export const longitudeValidator = number().notRequired().min(-139).max(-114).label('Longitude');

export const notInFutureValidator = date().test('not-in-future', 'Date cannot be in the future', (value) => {
  if (!value) return true;
  return value.getTime() <= Date.now();
});
