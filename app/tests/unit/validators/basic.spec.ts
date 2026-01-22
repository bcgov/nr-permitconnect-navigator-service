import { ProjectApplicant } from '../../../src/utils/enums/housing';
import { basicIntake, basicEnquiry } from '../../../src/validators/basic';

describe('basicIntakeSchema', () => {
  it('should validate when projectApplicantType is valid', () => {
    const data = {
      projectApplicantType: ProjectApplicant.BUSINESS,
      registeredName: 'My Company'
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when projectApplicantType is invalid', () => {
    const data = {
      projectApplicantType: 'invalid',
      registeredName: 'My Company'
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeDefined();
  });
});

function validEnquiryData() {
  return {
    enquiryDescription: 'testString',
    relatedActivityId: '226C0661'
  };
}

describe('basicEnquirySchema', () => {
  it('should not throw errors for valid data', () => {
    const result = basicEnquiry.validate(validEnquiryData());
    expect(result.error).toBeUndefined();
  });

  it('should reject non-string values', () => {
    const testData = {
      enquiryDescription: 123,
      relatedActivityId: 123
    };

    const result = basicEnquiry.validate(testData);
    expect(result.error).toBeDefined();
  });

  it('relatedActivityId should respect character limit', () => {
    const testData = {
      ...validEnquiryData()
    };
    testData.relatedActivityId = 'a'.repeat(256);

    const result = basicEnquiry.validate(testData);
    expect(result.error).toBeDefined();
  });

  it('should not be empty', () => {
    const testData = {};

    const result = basicEnquiry.validate(testData);
    expect(result.error).toBeDefined();
  });
});
