import { applicant as applicantSchema } from '../../../src/validators/applicant';

describe('applicantSchema', () => {
  it('should only accept string values for each field', () => {
    const applicant = {
      contactPreference: 123,
      contactEmail: 123,
      contactFirstName: 123,
      contactLastName: 123,
      contactPhoneNumber: 123,
      contactApplicantRelationship: 123
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not exceed the 255 character limit for any fields', () => {
    const applicant = {
      contactPreference: 'a'.repeat(256),
      contactEmail: 'a'.repeat(256),
      contactFirstName: 'a'.repeat(256),
      contactLastName: 'a'.repeat(256),
      contactPhoneNumber: 'a'.repeat(256),
      contactApplicantRelationship: 'a'.repeat(256)
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
      contactPreference: 'Email',
      contactEmail: 'test@example.com',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactPhoneNumber: '1234567890',
      contactApplicantRelationship: 'Employee'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeUndefined();
  });

  it('should not accept invalid email', () => {
    const applicant = {
      contactPreference: 'Email',
      contactEmail: 'not-an-email',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactPhoneNumber: '1234567890',
      contactApplicantRelationship: 'Employee'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const applicant = {
      contactPreference: 'Email',
      contactEmail: 'test@example.com',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactPhoneNumber: '+1234567890',
      contactApplicantRelationship: 'Employee'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('should not accept invalid phone number', () => {
    const applicant = {
      contactPreference: 'Email',
      contactEmail: 'test@example.com',
      contactFirstName: 'John',
      contactLastName: 'Doe',
      contactPhoneNumber: '12345678901',
      contactApplicantRelationship: 'Employee'
    };
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });
});
