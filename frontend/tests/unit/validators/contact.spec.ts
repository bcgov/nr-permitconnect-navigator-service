import { runSchema } from '../../helpers';
import { contactFormSchema, contactSchema, createContactSchema } from '@/validators/contact';
import { ContactPreference, ProjectRelationship } from '@/utils/enums/projectCommon';

// Mocks

// Fixtures

const testCreateContact = {
  contactApplicantRelationship: ProjectRelationship.OWNER,
  contactPreference: ContactPreference.EMAIL,
  email: 'a@b.co',
  firstName: 'First',
  phoneNumber: '555-555-5555'
};

const testContact = { ...testCreateContact, contactId: 'a7a6b0d4-3c4f-4b89-9d24-1f3a2e5d6c7b' };

// Mount

// Tests

describe('contact validators', () => {
  // Run against the yup original and its zod copy until the yup version is removed; the zod copy fixes the 'v4' message
  describe.each([
    ['yup', createContactSchema, 'v4'],
    ['zod', contactFormSchema.omit({ contactId: true }), 'User ID must be a valid UUID']
  ])('createContactSchema (%s)', (_, createContactSchema, invalidUserIdMessage) => {
    it('accepts a well-formed contact', async () => {
      expect(await runSchema(createContactSchema, testCreateContact)).toEqual({
        value: testCreateContact,
        errors: {}
      });
    });

    it('requires the mandatory fields', async () => {
      expect((await runSchema(createContactSchema, {})).errors).toEqual({
        contactApplicantRelationship: 'Relationship to project is a required field',
        contactPreference: 'Preferred contact method is a required field',
        email: 'Email is a required field',
        firstName: 'First name is a required field',
        phoneNumber: 'Phone number is a required field'
      });
    });

    it('rejects malformed values', async () => {
      expect(
        (
          await runSchema(createContactSchema, {
            ...testCreateContact,
            contactApplicantRelationship: 'x',
            contactPreference: 'Fax',
            email: 'bad',
            firstName: 'a'.repeat(256),
            lastName: 'a'.repeat(256),
            userId: 'nope'
          })
        ).errors
      ).toEqual({
        userId: invalidUserIdMessage,
        contactApplicantRelationship:
          'Relationship to project must be one of the following values: Property owner, Project consultant, Other',
        contactPreference: 'Preferred contact method must be one of the following values: Phone call, Email, Either',
        email: 'Email must be valid',
        firstName: 'First name must be at most 255 characters',
        lastName: 'Last name must be at most 255 characters'
      });
    });
  });

  describe.each([
    ['yup', contactSchema, 'v4'],
    ['zod', contactFormSchema, 'Contact ID must be a valid UUID']
  ])('contactSchema (%s)', (_, contactSchema, invalidContactIdMessage) => {
    it('accepts a well-formed contact', async () => {
      expect(await runSchema(contactSchema, testContact)).toEqual({ value: testContact, errors: {} });
    });

    it('additionally requires a uuid contactId', async () => {
      expect((await runSchema(contactSchema, testCreateContact)).errors).toEqual({
        contactId: 'Contact ID is a required field'
      });
      expect((await runSchema(contactSchema, { ...testContact, contactId: 'x' })).errors).toEqual({
        contactId: invalidContactIdMessage
      });
    });
  });
});
