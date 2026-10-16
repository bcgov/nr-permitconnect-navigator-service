import { runSchema } from '../../../helpers';
import { createProjectIntakeSchema } from '@/validators/electrification/projectIntakeFormSchema';
import { ElectrificationProjectType } from '@/utils/enums/codeEnums';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

import type { CodeTableName } from '@/types';

// Mocks

// Fixtures

const codeList = {
  ElectrificationProjectType: [ElectrificationProjectType.IPP_SOLAR, ElectrificationProjectType.OTHER]
} as unknown as Record<CodeTableName, string[]>;

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const testForm = {
  basic: { registeredId: 'BC123', registeredName: 'Test Co', projectName: 'Project' },
  contacts: {
    contactApplicantRelationship: ProjectRelationship.OWNER,
    contactPreference: ContactPreference.EMAIL,
    contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
    email: 'a@b.co',
    firstName: 'First',
    phoneNumber: '555-555-5555'
  },
  project: { projectType: ElectrificationProjectType.IPP_SOLAR, bcHydroNumber: '12345' }
};

// Mount

const schema = createProjectIntakeSchema(codeList, orgBookOptions);

// Tests

describe('electrification createProjectIntakeSchema', () => {
  it('accepts a well-formed intake', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty intake', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'basic.projectName': 'Project name is a required field',
      'basic.registeredName': 'Business name is a required field',
      'contacts.contactId': 'Contact ID is a required field',
      'contacts.contactApplicantRelationship': 'Relationship to project is a required field',
      'contacts.contactPreference': 'Preferred contact method is a required field',
      'contacts.email': 'Email is a required field',
      'contacts.firstName': 'First name is a required field',
      'contacts.phoneNumber': 'Phone number is a required field',
      'project.projectType': 'Project type is a required field'
    });
  });

  it('rejects malformed basic and project values', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          basic: { registeredName: 'Not a suggestion', projectName: 'a'.repeat(256) },
          project: { projectType: 'NOT_A_TYPE', bcHydroNumber: 'a'.repeat(256) }
        })
      ).errors
    ).toEqual({
      'basic.projectName': 'Project name must be at most 255 characters',
      'basic.registeredName': 'Business name must be a valid value from the list of suggestions',
      'project.projectType': 'Project type must be one of the following values: IPP_SOLAR, OTHER',
      'project.bcHydroNumber': 'BC Hydro Call for Power project number must be at most 255 characters'
    });
  });

  // Known bug: when('$project.projectType') reads yup context, which ProjectIntakeForm never passes,
  // so the description is never required even for the OTHER project type
  it('does not require a project description for the OTHER project type', async () => {
    expect(
      (await runSchema(schema, { ...testForm, project: { projectType: ElectrificationProjectType.OTHER } })).errors
    ).toEqual({});
  });
});
