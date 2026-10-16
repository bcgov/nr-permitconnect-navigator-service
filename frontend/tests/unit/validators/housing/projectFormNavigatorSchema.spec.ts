import { runSchema, t } from '../../../helpers';
import { createProjectFormNavigatorSchema } from '@/validators/housing/projectFormNavigatorSchema';
import { BasicResponse, Initiative } from '@/utils/enums/application';
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
  companyProjectName: { projectName: 'Project' },
  location: { naturalDisaster: BasicResponse.NO },
  units: { hasRentalUnits: BasicResponse.NO },
  finance: {
    financiallySupportedBc: BasicResponse.NO,
    financiallySupportedHousingCoop: BasicResponse.NO,
    financiallySupportedIndigenous: BasicResponse.NO,
    financiallySupportedNonProfit: BasicResponse.NO
  },
  projectDescription: { description: 'Description' },
  submissionState: {
    applicationStatus: ApplicationStatus.NEW,
    assignedUser: null,
    queuePriority: 1,
    submissionType: SubmissionType.GUIDANCE
  },
  atsInfo: { atsClientId: null, atsEnquiryId: null, businessArea: null },
  projectAreasUpdated: { aaiUpdated: true, addedToAts: false, ltsaCompleted: false, bcOnlineCompleted: false },
  consent: { consentToFeedback: BasicResponse.YES }
};

// Mount

const schema = createProjectFormNavigatorSchema({ initiative: Initiative.HOUSING, t, codeList, orgBookOptions });

// Tests

describe('housing createProjectFormNavigatorSchema', () => {
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
      'companyProjectName.projectName': 'Project name is a required field',
      'location.naturalDisaster': 'Affected by natural disaster is a required field',
      'units.hasRentalUnits': 'Rental included is a required field',
      'finance.financiallySupportedBc': 'BC Housing is a required field',
      'finance.financiallySupportedIndigenous': 'Indigenous Housing Provider is a required field',
      'finance.financiallySupportedNonProfit': 'Non-profit housing society is a required field',
      'finance.financiallySupportedHousingCoop': 'Housing co-operative is a required field',
      'projectDescription.description': 'Additional information about project is a required field',
      'submissionState.applicationStatus': 'Project state is a required field',
      'submissionState.assignedUser': 'Assigned to must be empty or a selected user',
      'submissionState.queuePriority': 'Priority is a required field',
      'submissionState.submissionType': 'Submission type is a required field',
      'projectAreasUpdated.aaiUpdated': AAI_REQUIRED,
      'projectAreasUpdated.addedToAts': AAI_REQUIRED,
      'projectAreasUpdated.ltsaCompleted': AAI_REQUIRED,
      'projectAreasUpdated.bcOnlineCompleted': 'BC Online completed is a required field',
      'consent.consentToFeedback': 'Consent to feedback is a required field'
    });
  });

  it('requires rental units and finance descriptions when answered Yes', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          units: { hasRentalUnits: BasicResponse.YES },
          finance: { ...testForm.finance, financiallySupportedIndigenous: BasicResponse.YES }
        })
      ).errors
    ).toEqual({
      'units.rentalUnits': 'Rental units is a required field',
      'finance.indigenousDescription': 'Name of Indigenous Housing Provider is a required field'
    });
  });
});
