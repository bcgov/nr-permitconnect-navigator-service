import { contacts as contactsSchema } from '../../../src/validators/contact.ts';

describe('contactsSchema', () => {
  it('should only accept string values for each field', () => {
    const contacts = [
      {
        contactPreference: 123,
        email: 123,
        firstName: 123,
        lastName: 123,
        phoneNumber: 123,
        contactApplicantRelationship: 123
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });

  it('should not exceed the 255 character limit for any fields', () => {
    const contacts = [
      {
        contactPreference: 'a'.repeat(256),
        email: 'a'.repeat(256),
        firstName: 'a'.repeat(256),
        lastName: 'a'.repeat(256),
        phoneNumber: 'a'.repeat(256),
        contactApplicantRelationship: 'a'.repeat(256)
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });

  it('should not be empty', () => {
    const contacts = {};
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });

  it('should be a valid schema', () => {
    const contacts = [
      {
        contactPreference: 'Email',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        contactApplicantRelationship: 'Project consultant'
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeUndefined();
  });

  it('should not accept invalid email', () => {
    const contacts = [
      {
        contactPreference: 'Email',
        email: 'not-an-email',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '1234567890',
        contactApplicantRelationship: 'Project consultant'
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const contacts = [
      {
        contactPreference: 'Email',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        contactApplicantRelationship: 'Project consultant'
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const contacts = [
      {
        contactPreference: 'Email',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '12345678901',
        contactApplicantRelationship: 'Project consultant'
      }
    ];
    const result = contactsSchema.validate(contacts);
    expect(result.error).toBeDefined();
  });
});
