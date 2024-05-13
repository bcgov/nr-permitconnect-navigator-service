import { applicantSchema } from '../../../src/validators/applicant';

describe('applicantSchema', () => {
  it('Fields should only accept string', () => {
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

  it('Fields should not exceed maximum length', () => {
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

  it('All fields are required', () => {
    const applicant = {};
    const result = applicantSchema.validate(applicant);
    expect(result.error).toBeDefined();
  });

  it('Should be a valid schema', () => {
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

  it('Email should be an email', () => {
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
});
