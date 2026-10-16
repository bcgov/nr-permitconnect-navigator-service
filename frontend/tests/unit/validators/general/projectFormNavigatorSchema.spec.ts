import { runSchema, t } from '../../../helpers';
import { createProjectFormNavigatorSchema } from '@/validators/general/projectFormNavigatorSchema';
import { BasicResponse, Initiative } from '@/utils/enums/application';
import { ApplicationStatus, Area, Region, SubmissionType } from '@/utils/enums/projectCommon';

import type { CodeTableName } from '@/types';

// Mocks

// Fixtures

const codeList = {
  BusinessArea: ['AGRICULTURE'],
  ElectrificationProjectCategory: ['IPP'],
  ElectrificationProjectType: ['IPP_SOLAR', 'OTHER']
} as unknown as Record<CodeTableName, string[]>;

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const testForm = {
  contact: { email: 'a@b.co', firstName: 'First' },
  companyProjectName: { activityType: 'Other', projectName: 'Project' },
  location: { naturalDisaster: BasicResponse.NO },
  projectDescription: { description: 'Description' },
  submissionState: {
    applicationStatus: ApplicationStatus.NEW,
    area: Area.NORTH,
    assignedUser: null,
    queuePriority: 1,
    region: Region.SKEENA,
    submissionType: SubmissionType.GUIDANCE
  },
  atsInfo: { atsClientId: null, atsEnquiryId: null, businessArea: 'AGRICULTURE' },
  projectAreasUpdated: { aaiUpdated: true }
};

// Mount

const schema = createProjectFormNavigatorSchema({ initiative: Initiative.GENERAL, t, codeList, orgBookOptions });

// Tests

describe('general createProjectFormNavigatorSchema', () => {
  // Omitted optional panels are accepted
  it('accepts a well-formed form with optional panels omitted', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty form', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'contact.email': 'Contact email is a required field',
      'contact.firstName': 'Contact first name is a required field',
      'companyProjectName.activityType': 'Activity type is a required field',
      'companyProjectName.projectName': 'Project name is a required field',
      'location.naturalDisaster': 'Affected by natural disaster is a required field',
      'projectDescription.description': 'Additional information about project is a required field',
      'submissionState.applicationStatus': 'Project state is a required field',
      'submissionState.area': 'Area is a required field',
      'submissionState.assignedUser': 'Assigned to must be empty or a selected user',
      'submissionState.queuePriority': 'Priority is a required field',
      'submissionState.region': 'Region is a required field',
      'submissionState.submissionType': 'Submission type is a required field',
      'projectAreasUpdated.aaiUpdated': 'Authorization and Approvals Insight (AAI) updated is a required field'
    });
  });

  it('checks area, region and business area', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          submissionState: { ...testForm.submissionState, area: 'x', region: 'x' },
          atsInfo: { ...testForm.atsInfo, businessArea: 'NOPE' }
        })
      ).errors
    ).toEqual({
      'submissionState.area': 'Area is a required field',
      'submissionState.region': 'Region is a required field',
      'atsInfo.businessArea': 'Business area must be one of the following values: AGRICULTURE'
    });
  });
});
