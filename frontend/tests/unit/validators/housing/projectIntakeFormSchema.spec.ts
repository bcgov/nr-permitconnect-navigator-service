import { runSchema } from '../../../helpers';
import { createProjectIntakeSchema } from '@/validators/housing/projectIntakeFormSchema';
import { NUM_RESIDENTIAL_UNITS_LIST } from '@/utils/constants/housing';
import { BasicResponse } from '@/utils/enums/application';
import { ContactPreference, ProjectApplicant, ProjectLocation, ProjectRelationship } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const UNITS = NUM_RESIDENTIAL_UNITS_LIST[0];

const orgBookOptions = [{ registeredName: 'Test Co', registeredId: 'BC123' }];

const testHousing = {
  hasRentalUnits: BasicResponse.NO,
  financiallySupportedBc: BasicResponse.NO,
  financiallySupportedIndigenous: BasicResponse.NO,
  financiallySupportedNonProfit: BasicResponse.NO,
  financiallySupportedHousingCoop: BasicResponse.NO,
  singleFamilySelected: true,
  singleFamilyUnits: UNITS
};

const testForm = {
  basic: {
    consentToFeedback: false,
    projectApplicantType: ProjectApplicant.INDIVIDUAL,
    projectName: 'Project',
    projectDescription: 'Description'
  },
  contacts: {
    contactApplicantRelationship: ProjectRelationship.OWNER,
    contactPreference: ContactPreference.EMAIL,
    contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
    email: 'a@b.co',
    firstName: 'First',
    phoneNumber: '555-555-5555'
  },
  housing: testHousing,
  location: {
    naturalDisaster: BasicResponse.NO,
    projectLocation: ProjectLocation.STREET_ADDRESS,
    streetAddress: '1 Main St',
    locality: 'Victoria',
    province: 'BC'
  },
  permits: {
    hasAppliedProvincialPermits: BasicResponse.YES,
    appliedPermits: [{ permitTypeId: 1, submittedDate: new Date('2020-01-01') }]
  }
};

// Mount

const schema = createProjectIntakeSchema(orgBookOptions);

const sectionErrors = async (section: 'basic' | 'housing', values: Record<string, unknown>) =>
  (await runSchema(schema, { ...testForm, [section]: { ...testForm[section], ...values } })).errors;

// Tests

describe('housing createProjectIntakeSchema', () => {
  it('accepts a well-formed intake', async () => {
    const { value, errors } = await runSchema(schema, testForm);

    expect(errors).toEqual({});
    expect(value).toMatchObject(testForm);
  });

  it('reports every required field on an empty intake', async () => {
    expect((await runSchema(schema, {})).errors).toEqual({
      'basic.consentToFeedback': 'Consent to feedback is a required field',
      'basic.projectApplicantType': 'Project developed is a required field',
      'basic.projectName': 'Project name is a required field',
      'basic.projectDescription': 'Project description is a required field',
      'contacts.contactId': 'Contact ID is a required field',
      'contacts.contactApplicantRelationship': 'Relationship to project is a required field',
      'contacts.contactPreference': 'Preferred contact method is a required field',
      'contacts.email': 'Email is a required field',
      'contacts.firstName': 'First name is a required field',
      'contacts.phoneNumber': 'Phone number is a required field',
      'housing.hasRentalUnits': 'Rental units is a required field',
      'housing.financiallySupportedBc': 'BC Housing is a required field',
      'housing.financiallySupportedIndigenous': 'Indigenous Housing Provider is a required field',
      'housing.financiallySupportedNonProfit': 'Non-profit housing society is a required field',
      'housing.financiallySupportedHousingCoop': 'Housing co-operative is a required field',
      'housing.unitTypes': 'At least one residential unit type must be selected',
      'housing.singleFamilySelected': '\n',
      'housing.multiFamilySelected': '\n',
      'housing.otherSelected': '\n',
      'location.naturalDisaster': 'Natural disaster is a required field',
      'location.projectLocation': 'Location is a required field',
      'permits.hasAppliedProvincialPermits': 'Applied permits is a required field'
    });
  });

  describe('business registration', () => {
    it('requires isDevelopedInBc for a business applicant', async () => {
      expect(await sectionErrors('basic', { projectApplicantType: ProjectApplicant.BUSINESS })).toEqual({
        'basic.isDevelopedInBc': 'Registered in BC is a required field'
      });
    });

    it('requires registered id and name to be org book suggestions when registered in BC', async () => {
      const registered = { projectApplicantType: ProjectApplicant.BUSINESS, isDevelopedInBc: BasicResponse.YES };

      expect(await sectionErrors('basic', registered)).toEqual({
        'basic.registeredId': 'Business ID is a required field',
        'basic.registeredName': 'Business name is a required field'
      });
      expect(await sectionErrors('basic', { ...registered, registeredId: 'X', registeredName: 'Y' })).toEqual({
        'basic.registeredId': 'Failed to set the business ID, try selecting the business name again',
        'basic.registeredName': 'Business name must be a valid value from the list of suggestions'
      });
      expect(await sectionErrors('basic', { ...registered, registeredId: 'BC123', registeredName: 'Test Co' })).toEqual(
        {}
      );
    });

    it('trims and nulls registration fields when not registered in BC', async () => {
      const { value } = await runSchema(schema, {
        ...testForm,
        basic: {
          ...testForm.basic,
          projectApplicantType: ProjectApplicant.BUSINESS,
          isDevelopedInBc: BasicResponse.NO,
          registeredId: '',
          registeredName: '  Name  '
        }
      });

      expect(value).toMatchObject({ basic: { registeredId: null, registeredName: 'Name' } });
    });
  });

  describe('housing', () => {
    // unitTypes carries the message ResidentialUnitsCard displays; the blank checkbox errors drive its tab navigation
    it('requires at least one unit type to be selected', async () => {
      expect(await sectionErrors('housing', { singleFamilySelected: false, singleFamilyUnits: null })).toEqual({
        'housing.unitTypes': 'At least one residential unit type must be selected',
        'housing.singleFamilySelected': '\n',
        'housing.multiFamilySelected': '\n',
        'housing.otherSelected': '\n'
      });
    });

    it('requires details for every Yes answer and selected unit type', async () => {
      expect(
        await sectionErrors('housing', {
          hasRentalUnits: BasicResponse.YES,
          financiallySupportedIndigenous: BasicResponse.YES,
          financiallySupportedNonProfit: BasicResponse.YES,
          financiallySupportedHousingCoop: BasicResponse.YES,
          singleFamilyUnits: null,
          multiFamilySelected: true,
          otherSelected: true,
          otherUnitsDescription: '  '
        })
      ).toEqual({
        'housing.rentalUnits': 'Expected rental units is a required field',
        'housing.indigenousDescription': 'Indigenous housing provider is a required field',
        'housing.nonProfitDescription': 'Non-profit housing society is a required field',
        'housing.housingCoopDescription': 'Housing co-operative is a required field',
        'housing.singleFamilyUnits': 'Expected number of single-family units is a required field',
        'housing.multiFamilyUnits': 'Expected number of multi-family units is a required field',
        'housing.otherUnitsDescription': 'Description of units is a required field',
        'housing.otherUnits': 'Expected number of other units is a required field'
      });
    });

    // Unit counts must be valid ranges even when their unit type is not selected
    it('rejects malformed answers', async () => {
      expect(
        await sectionErrors('housing', {
          hasRentalUnits: 'wrongRentalUnit',
          singleFamilyUnits: 'x',
          multiFamilyUnits: 'x'
        })
      ).toEqual({
        'housing.hasRentalUnits': 'Rental units must be one of the following values: Yes, No, Unsure',
        'housing.multiFamilyUnits':
          'Expected number of multi-family units must be one of the following values: 1-9, 10-49, 50-500, >500, Unsure',
        'housing.singleFamilyUnits':
          'Expected number of single-family units must be one of the following values: 1-9, 10-49, 50-500, >500, Unsure'
      });
    });
  });

  it('rejects malformed location and permit values', async () => {
    expect(
      (
        await runSchema(schema, {
          ...testForm,
          location: { ...testForm.location, projectLocation: '', latitude: '12' },
          permits: {
            appliedPermits: [{ permitTypeId: '', submittedDate: new Date() }],
            hasAppliedProvincialPermits: 123
          }
        })
      ).errors
    ).toMatchObject({
      'location.projectLocation': 'Location is a required field',
      'permits.hasAppliedProvincialPermits': 'Applied permits must be one of the following values: Yes, No, Unsure'
    });
  });
});
