import { runSchema, t } from '../../../helpers';
import { createProjectFormNavigatorSchema } from '@/validators/electrification/projectFormNavigatorSchema';
import { Initiative } from '@/utils/enums/application';
import { ApplicationStatus, SubmissionType } from '@/utils/enums/projectCommon';

import type { CodeTableName } from '@/types';

// Mocks

// Fixtures

const codeList = {
  BusinessArea: ['AGRICULTURE'],
  ElectrificationProjectCategory: ['IPP'],
  ElectrificationProjectType: ['IPP_SOLAR', 'OTHER']
} as unknown as Record<CodeTableName, string[]>;

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const AAI_REQUIRED = 'Authorization and Approvals Insight (AAI) updated is a required field';

const testForm = {
  contact: { email: 'a@b.co', firstName: 'First' },
  electrification: { projectType: 'IPP_SOLAR' },
  companyProjectName: { companyNameRegistered: 'Test Co', projectName: 'Project' },
  projectDescription: { description: '' },
  submissionState: {
    applicationStatus: ApplicationStatus.NEW,
    assignedUser: null,
    queuePriority: 1,
    submissionType: SubmissionType.GUIDANCE
  },
  atsInfo: { atsClientId: null, atsEnquiryId: null, businessArea: 'NOT_CHECKED' },
  projectAreasUpdated: { aaiUpdated: true, addedToAts: false }
};

// Mount

const schema = createProjectFormNavigatorSchema({
  initiative: Initiative.ELECTRIFICATION,
  t,
  codeList,
  orgBookOptions
});

// Tests

describe('electrification createProjectFormNavigatorSchema', () => {
  // Omitted optional panels are accepted (yup outputs them as {})
  it('accepts a well-formed form with optional panels omitted', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty form', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'contact.email': 'Contact email is a required field',
      'contact.firstName': 'Contact first name is a required field',
      'electrification.projectType': 'Project type is a required field',
      'companyProjectName.companyNameRegistered': 'Company name is a required field',
      'companyProjectName.projectName': 'Project name is a required field',
      'submissionState.applicationStatus': 'Project state is a required field',
      'submissionState.assignedUser': 'Assigned to must be empty or a selected user',
      'submissionState.queuePriority': 'Priority is a required field',
      'submissionState.submissionType': 'Submission type is a required field',
      'projectAreasUpdated.aaiUpdated': AAI_REQUIRED,
      'projectAreasUpdated.addedToAts': 'Authorized Tracking System (ATS) updated is a required field'
    });
  });

  it('requires the company name to be an org book suggestion', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          companyProjectName: { companyNameRegistered: 'Nope', projectName: 'Project' }
        })
      ).errors
    ).toEqual({
      'companyProjectName.companyNameRegistered': 'Company name must be a valid value from the list of suggestions'
    });
  });

  // Known bug: the OTHER project type should require a description, see navigator.spec.ts
  it('does not require a description for the OTHER project type', async () => {
    expect((await runSchema(schema, { ...testForm, electrification: { projectType: 'OTHER' } })).errors).toEqual({});
  });
});
