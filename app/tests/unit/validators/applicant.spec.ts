import { applicant as applicantSchema } from '../../../src/validators/applicant';

describe('applicantSchema', () => {
  it('should only accept string values for each field', () => {
    const applicant = {
      contactPreference: 123,
      email: 123,
      firstName: 123,
      lastName: 123,
      phoneNumber: 123,
      relationshipToProject: 123
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not exceed the 255 character limit for any fields', () => {
    const applicant = {
      contactPreference: 'a'.repeat(256),
      email: 'a'.repeat(256),
      firstName: 'a'.repeat(256),
      lastName: 'a'.repeat(256),
      phoneNumber: 'a'.repeat(256),
      relationshipToProject: 'a'.repeat(256)
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not be empty', () => {
    const applicant = {};
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should be a valid schema', () => {
    const applicant = {
      contactPreference: 'email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      relationshipToProject: 'test'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeUndefined();
  });

  it('should not accept invalid email', () => {
    const applicant = {
      contactPreference: 'email',
      email: 'not-an-email',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '1234567890',
      relationshipToProject: 'test'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const applicant = {
      contactPreference: 'email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '+1234567890',
      relationshipToProject: 'test'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const applicant = {
      contactPreference: 'email',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phoneNumber: '12345678901',
      relationshipToProject: 'test'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });
});
