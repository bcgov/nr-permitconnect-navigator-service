import { BasicResponse } from '../../../src/utils/enums/application';
import { basicIntake, basicEnquiry } from '../../../src/validators/basic';

describe('basicIntakeSchema', () => {
  it('should validate when isDevelopedByCompanyOrOrg and isDevelopedInBC are valid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: BasicResponse.YES,
      isDevelopedInBC: BasicResponse.YES,
      registeredName: 'My Company'
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when isDevelopedByCompanyOrOrg is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: 'invalid',
      isDevelopedInBC: BasicResponse.YES,
      registeredName: 'My Company'
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: BasicResponse.YES,
      isDevelopedInBC: 'invalid'
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is YES but registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: BasicResponse.YES,
      isDevelopedInBC: BasicResponse.YES
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is NO and registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: BasicResponse.YES,
      isDevelopedInBC: BasicResponse.NO
    };

    const result = basicIntake.validate(data);
    expect(result.error).toBeDefined();
  });
});

function validEnquiryData() {
  return {
    isRelated: 'No',
    enquiryDescription: 'testString',
    relatedActivityId: '226C0661',
    applyForPermitConnect: 'No'
  };
}

describe('basicEnquirySchema', () => {
  it('should not throw errors for valid data', () => {
    const result = basicEnquiry.validate(validEnquiryData());
    expect(result.error).toBeUndefined();
  });

  it('should reject non-string values', () => {
    const testData = {
      isRelated: 123,
      enquiryDescription: 123,
      relatedActivityId: 123,
      applyForPermitConnect: 123
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
