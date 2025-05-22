import { boolean, number, object, string } from 'yup';

import { YES_NO_LIST } from '@/utils/constants/application';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import {
  APPLICATION_STATUS_LIST,
  INTAKE_STATUS_LIST,
  QUEUE_PRIORITY,
  SUBMISSION_TYPE_LIST
} from '@/utils/constants/projectCommon';
import { IntakeStatus } from '@/utils/enums/projectCommon';
import { assignedToValidator, atsClientIdValidator } from '@/validators';
import { emailValidator } from '@/validators/common';

import type { CodeName } from '@/store/codeStore';

// Form validation schema
const stringRequiredSchema = string().required().max(255);

export function createProjectFormSchema(
  codeValues: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>
) {
  return object({
    aaiUpdated: boolean().required().label('Authorization and Approvals Insight (AAI) updated'),
    astNotes: string().notRequired().max(4000).label('Automated Status Tool (AST) notes'),
    atsClientId: atsClientIdValidator,
    contact: object({
      email: emailValidator('Contact email must be valid').required().label('Contact email'),
      firstName: string().required().max(255).label('Contact first name'),
      lastName: string().max(255).label('Contact last name').nullable(),
      phoneNumber: string().required().label('Contact phone number'),
      contactApplicantRelationship: string()
        .required()
        .oneOf(PROJECT_RELATIONSHIP_LIST)
        .label('Relationship to project'),
      contactPreference: string().required().oneOf(CONTACT_PREFERENCE_LIST).label('Preferred contact method')
    }),
    locationDescription: string().notRequired().max(4000).label('Location'),
    project: object({
      bcEnvironmentAssessNeeded: string().notRequired().oneOf(YES_NO_LIST).label('BC Environmental Assessment needed?'),
      bcHydroNumber: string().notRequired().nullable().max(255).label('BC Hydro Call for Power project number'),
      companyNameRegistered: string().notRequired().max(255).label('Company name'),
      hasEpa: string().notRequired().oneOf(YES_NO_LIST).label('Do they have an EPA?'),
      megawatts: number()
        .notRequired()
        .positive('Must be a positive number.')
        .label('How man megawatts will it produce?'),
      projectName: stringRequiredSchema.label('Project name'),
      projectType: stringRequiredSchema.oneOf(codeValues.ElectrificationProjectType).label('Project type'),
      projectCategory: string().notRequired().oneOf(codeValues.ElectrificationProjectCategory).label('Project category')
    }),
    projectDescription: string().when('project.projectType', {
      is: enums.ElectrificationProjectType.OTHER,
      then: (schema) => schema.required().label('Additional information about your project'),
      otherwise: (schema) => schema.notRequired().nullable().label('Additional information about your project')
    }),
    submissionState: object({
      applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Project state'),
      assignedUser: assignedToValidator('intakeStatus', IntakeStatus.SUBMITTED),
      intakeStatus: string().oneOf(INTAKE_STATUS_LIST).label('Intake state'),
      queuePriority: number()
        .required()
        .integer()
        .oneOf(QUEUE_PRIORITY)
        .typeError('Priority must be a number')
        .label('Priority'),
      submissionType: string().required().oneOf(SUBMISSION_TYPE_LIST).label('Submission type')
    })
  });
}
