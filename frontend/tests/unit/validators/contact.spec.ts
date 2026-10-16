import { runSchema } from '../../helpers';
import { contactFormSchema } from '@/validators/contact';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const testContact = {
  contactApplicantRelationship: ProjectRelationship.OWNER,
  contactPreference: ContactPreference.EMAIL,
  contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b',
  email: 'a@b.co',
  firstName: 'First',
  phoneNumber: '555-555-5555'
};

// Mount

// Tests

describe('contactFormSchema', () => {
  it('accepts a well-formed contact', async () => {
    expect(await runSchema(contactFormSchema, testContact)).toEqual({ value: testContact, errors: {} });
  });

  it('requires the mandatory fields', async () => {
    expect((await runSchema(contactFormSchema, {})).errors).toEqual({
      contactApplicantRelationship: 'Relationship to project is a required field',
      contactId: 'Contact ID is a required field',
      contactPreference: 'Preferred contact method is a required field',
      email: 'Email is a required field',
      firstName: 'First name is a required field',
      phoneNumber: 'Phone number is a required field'
    });
  });

  it('rejects malformed values', async () => {
    expect(
      (
        await runSchema(contactFormSchema, {
          ...testContact,
          contactApplicantRelationship: 'x',
          contactId: 'x',
          contactPreference: 'Fax',
          email: 'bad',
          firstName: 'a'.repeat(256),
          lastName: 'a'.repeat(256),
          userId: 'nope'
        })
      ).errors
    ).toEqual({
      userId: 'User ID must be a valid UUID',
      contactApplicantRelationship:
        'Relationship to project must be one of the following values: Property owner, Project consultant, Other',
      contactId: 'Contact ID must be a valid UUID',
      contactPreference: 'Preferred contact method must be one of the following values: Phone call, Email, Either',
      email: 'Email must be valid',
      firstName: 'First name must be at most 255 characters',
      lastName: 'Last name must be at most 255 characters'
    });
  });
});
