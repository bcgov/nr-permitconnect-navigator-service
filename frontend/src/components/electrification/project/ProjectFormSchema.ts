import { boolean, number, object, string } from 'yup';

import { YES_NO_LIST } from '@/utils/constants/application';
import { CONTACT_PREFERENCE_LIST, PROJECT_RELATIONSHIP_LIST } from '@/utils/constants/projectCommon';
import { APPLICATION_STATUS_LIST, QUEUE_PRIORITY, SUBMISSION_TYPE_LIST } from '@/utils/constants/projectCommon';
import { assignedToValidator, atsClientIdValidator } from '@/validators';
import { emailValidator } from '@/validators/common';

import type { CodeName } from '@/store/codeStore';
import type { OrgBookOption } from '@/types';

export function createProjectFormSchema(
  codeList: Record<CodeName, string[]>,
  enums: Record<CodeName, Record<string, string>>,
  orgBookOptions: OrgBookOption[]
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
      bcHydroNumber: string().required().max(255).label('BC Hydro Call for Power project number'),
      companyNameRegistered: string()
        .required()
        .max(255)
        .test('valid-company-name', 'Company name must be a valid value from the list of suggestions', (value) => {
          if (!value) return false;
          return orgBookOptions.some((option) => option.registeredName === value);
        })
        .label('Company name'),
      hasEpa: string().notRequired().oneOf(YES_NO_LIST).label('Do they have an EPA?'),
      megawatts: number()
        .notRequired()
        .positive('Must be a positive number.')
        .label('How man megawatts will it produce?'),
      projectName: string().required().max(255).label('Project name'),
      projectType: string().required().max(255).oneOf(codeList.ElectrificationProjectType).label('Project type'),
      projectCategory: string().notRequired().oneOf(codeList.ElectrificationProjectCategory).label('Project category')
    }),
    projectDescription: string().when('project.projectType', {
      is: enums.ElectrificationProjectType.OTHER,
      then: (schema) => schema.required().label('Additional information about your project'),
      otherwise: (schema) => schema.notRequired().nullable().label('Additional information about your project')
    }),
    submissionState: object({
      applicationStatus: string().oneOf(APPLICATION_STATUS_LIST).label('Project state'),
      // assignedUser: assignedToValidator('intakeStatus', IntakeStatus.SUBMITTED),
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
