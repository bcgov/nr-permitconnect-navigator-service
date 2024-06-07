import { mixed, number, string } from 'yup';

import { Regex } from '@/utils/enums/application';

export const assignedToValidator = (when: string, is: any) =>
  mixed()
    .when(when, {
      is: (val: typeof is) => val === is,
      then: (schema) =>
        schema
          .test('expect-user-or-empty', 'Assigned to must be empty or a selected user', (obj) => {
            if (typeof obj === 'object') return true;
            if (typeof obj === 'string') {
              return obj === null || obj === undefined || obj.length === 0;
            }
          })
          .nullable(),
      otherwise: (schema) =>
        schema
          .test('expect-user', 'Assigned to must be a selected user', (obj) => {
            return typeof obj === 'object';
          })
          .required()
    })
    .label('Assigned to');
export const emailValidator = (message: string) => string().matches(new RegExp(Regex.EMAIL), message);
export const latitudeValidator = number().required().min(48).max(60).label('Latitude');
export const longitudeValidator = number().required().min(-139).max(-114).label('Longitude');
