import { ProjectType } from '@/utils/enums/electrification';
import { IntakeFormCategory } from '@/utils/enums/housing';
import { contactValidator } from '@/validators';
import { object, string } from 'yup';

// Form validation schema
const stringRequiredSchema = string().required().max(255);

export const projectIntakeSchema = object({
  [IntakeFormCategory.CONTACTS]: object(contactValidator),
  project: object({
    companyNameRegistered: stringRequiredSchema.label('Business name'),
    projectName: stringRequiredSchema.label('Project name'),
    projectType: stringRequiredSchema.label('Project type'),
    bcHydroNumber: string().when('projectType', {
      is: (value: string) => value === ProjectType.IPP_SOLAR || value === ProjectType.IPP_WIND,
      then: (schema) => schema.required().label('BC Hydro Call for Power project number'),
      otherwise: (schema) => schema.notRequired().nullable().label('BC Hydro Call for Power project number')
    }),
    projectDescription: string().when('projectType', {
      is: ProjectType.OTHER,
      then: (schema) => schema.required().label('Project description'),
      otherwise: (schema) => schema.notRequired().nullable().label('Project description')
    })
  })
});
