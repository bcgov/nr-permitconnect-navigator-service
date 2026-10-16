import { runSchema } from '../../../helpers';
import { createProjectIntakeSchema } from '@/validators/general/projectIntakeFormSchema';
import { BasicResponse } from '@/utils/enums/application';
import { ContactPreference, ProjectApplicant, ProjectLocation, ProjectRelationship } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const testForm = {
  contacts: {
    contactApplicantRelationship: ProjectRelationship.OWNER,
    contactPreference: ContactPreference.EMAIL,
    contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
    email: 'a@b.co',
    firstName: 'First',
    phoneNumber: '555-555-5555'
  },
  basic: {
    projectApplicantType: ProjectApplicant.INDIVIDUAL,
    projectName: 'Project',
    projectDescription: 'Description',
    projectNumber: 'PN-1'
  },
  location: {
    naturalDisaster: BasicResponse.NO,
    projectLocation: ProjectLocation.LOCATION_COORDINATES,
    latitude: 51,
    longitude: -120
  },
  permits: { hasAppliedProvincialPermits: BasicResponse.NO }
};

// Mount

const schema = createProjectIntakeSchema(orgBookOptions);

const basicErrors = async (basic: Record<string, unknown>) =>
  (await runSchema(schema, { ...testForm, basic: { ...testForm.basic, ...basic } })).errors;

// Tests

describe('general createProjectIntakeSchema', () => {
  it('accepts a well-formed intake', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty intake', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'contacts.contactId': 'Contact ID is a required field',
      'contacts.contactApplicantRelationship': 'Relationship to project is a required field',
      'contacts.contactPreference': 'Preferred contact method is a required field',
      'contacts.email': 'Email is a required field',
      'contacts.firstName': 'First name is a required field',
      'contacts.phoneNumber': 'Phone number is a required field',
      'basic.projectApplicantType': 'Project developed is a required field',
      'basic.projectName': 'Project name is a required field',
      'basic.projectDescription': 'Project description is a required field',
      'location.naturalDisaster': 'Natural disaster is a required field',
      'location.projectLocation': 'Location is a required field',
      'permits.hasAppliedProvincialPermits': 'Applied permits is a required field'
    });
  });

  describe('business registration', () => {
    it('requires isDevelopedInBc for a business applicant', async () => {
      expect(await basicErrors({ projectApplicantType: ProjectApplicant.BUSINESS })).toEqual({
        'basic.isDevelopedInBc': 'Registered in BC is a required field'
      });
    });

    it('requires registered id and name to be org book suggestions when registered in BC', async () => {
      const registered = { projectApplicantType: ProjectApplicant.BUSINESS, isDevelopedInBc: BasicResponse.YES };

      expect(await basicErrors(registered)).toEqual({
        'basic.registeredId': 'Business ID is a required field',
        'basic.registeredName': 'Business name is a required field'
      });
      expect(await basicErrors({ ...registered, registeredId: 'X', registeredName: 'Y' })).toEqual({
        'basic.registeredId': 'Failed to set the business ID, try selecting the business name again',
        'basic.registeredName': 'Business name must be a valid value from the list of suggestions'
      });
      expect(await basicErrors({ ...registered, registeredId: 'BC123', registeredName: 'Test Co' })).toEqual({});
    });

    it('ignores registration fields when not registered in BC', async () => {
      expect(
        await basicErrors({
          projectApplicantType: ProjectApplicant.BUSINESS,
          isDevelopedInBc: BasicResponse.NO,
          registeredId: 'X',
          registeredName: 'Y'
        })
      ).toEqual({});
    });

    // The otherwise branch drops the oneOf check
    it('accepts any isDevelopedInBc value for an individual applicant', async () => {
      expect(await basicErrors({ isDevelopedInBc: 'Maybe', registeredId: '', registeredName: null })).toEqual({});
    });
  });

  it('rejects malformed basic, location and permit values', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          basic: { ...testForm.basic, projectApplicantType: 'x', projectNumber: 'a'.repeat(256) },
          location: { ...testForm.location, latitude: 12 },
          permits: { hasAppliedProvincialPermits: 123 }
        })
      ).errors
    ).toEqual({
      'basic.projectApplicantType': 'Project developed must be one of the following values: Business, Individual',
      'basic.projectNumber': 'Project number must be at most 255 characters',
      'location.latitude': 'Latitude must be greater than or equal to 48',
      'permits.hasAppliedProvincialPermits': 'Applied permits must be one of the following values: Yes, No, Unsure'
    });
  });
});
