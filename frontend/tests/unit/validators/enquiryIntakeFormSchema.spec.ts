import { runSchema } from '../../helpers';
import { enquiryIntakeFormSchema } from '@/validators/enquiryIntakeFormSchema';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const testEnquiry = {
  basic: { enquiryDescription: 'Description' },
  contacts: {
    contactApplicantRelationship: ProjectRelationship.OWNER,
    contactPreference: ContactPreference.EMAIL,
    contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
    email: 'a@b.co',
    firstName: 'First',
    phoneNumber: '555-555-5555'
  }
};

// Mount

// Tests

describe('enquiryIntakeFormSchema', () => {
  it('accepts a well-formed enquiry', async () => {
    expect(await runSchema(enquiryIntakeFormSchema, testEnquiry)).toEqual({ value: testEnquiry, errors: {} });
  });

  it('requires the description and contact fields', async () => {
    expect((await runSchema(enquiryIntakeFormSchema, {})).errors).toEqual({
      'basic.enquiryDescription': 'Enquiry is a required field',
      'contacts.contactId': 'Contact ID is a required field',
      'contacts.contactApplicantRelationship': 'Relationship to project is a required field',
      'contacts.contactPreference': 'Preferred contact method is a required field',
      'contacts.email': 'Email is a required field',
      'contacts.firstName': 'First name is a required field',
      'contacts.phoneNumber': 'Phone number is a required field'
    });
  });
});
