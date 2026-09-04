import { contactSchema } from '#src/validators/contact';

describe('contactSchema', () => {
  it('should only accept string values for each field', () => {
    const contact = {
      contactPreference: 123,
      email: 123,
      firstName: 123,
      lastName: 123,
      phoneNumber: 123,
      contactApplicantRelationship: 123
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it('should not exceed the 255 character limit for any fields', () => {
    const contact = {
      email: 'a'.repeat(256),
      firstName: 'a'.repeat(256),
      lastName: 'a'.repeat(256),
      phoneNumber: 'a'.repeat(256),
      contactApplicantRelationship: 'a'.repeat(256)
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it('should not be empty', () => {
    const contact = {};
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it('should be a valid schema', () => {
    const contact = {
      contactPreference: 'Email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      contactApplicantRelationship: 'Project consultant'
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(true);
  });

  it('should not accept invalid email', () => {
    const contact = {
      contactPreference: 'Email',
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      contactApplicantRelationship: 'Project consultant'
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it('should not accept invalid phone number', () => {
    const contact = {
      contactPreference: 'Email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      contactApplicantRelationship: 'Project consultant'
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });

  it('should not accept a phone number with too many digits', () => {
    const contact = {
      contactPreference: 'Email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678901',
      contactApplicantRelationship: 'Project consultant'
    };
    const result = contactSchema.safeParse(contact);
    expect(result.success).toBe(false);
  });
});
