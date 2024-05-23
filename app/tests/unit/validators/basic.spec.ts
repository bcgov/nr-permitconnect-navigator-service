import { basicIntakeSchema, basicEnquirySchema } from '../../../src/validators/basic';
import { YES_NO } from '../../../src/components/constants';

describe('basicIntakeSchema', () => {
  it('should validate when isDevelopedByCompanyOrOrg and isDevelopedInBC are valid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.YES,
      registeredName: 'My Company'
    };

    const result = basicIntakeSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when isDevelopedByCompanyOrOrg is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: 'invalid',
      isDevelopedInBC: YES_NO.YES,
      registeredName: 'My Company'
    };

    const result = basicIntakeSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: 'invalid'
    };

    const result = basicIntakeSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is YES but registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.YES
    };

    const result = basicIntakeSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should not throw an error when isDevelopedInBC is NO and registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.NO
    };

    const result = basicIntakeSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when isDevelopedInBC is NO but registeredName is provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.NO,
      registeredName: 'My Company'
    };

    const result = basicIntakeSchema.validate(data);
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
    const result = basicEnquirySchema.validate(validEnquiryData());
    expect(result.error).toBeUndefined();
  });

  it('should reject non-string values', () => {
    const testData = {
      isRelated: 123,
      enquiryDescription: 123,
      relatedActivityId: 123,
      applyForPermitConnect: 123
    };

    const result = basicEnquirySchema.validate(testData);
    expect(result.error).toBeDefined();
  });

  it('relatedActivityId should respect character limit', () => {
    const testData = {
      ...validEnquiryData()
    };
    testData.relatedActivityId = 'a'.repeat(256);

    const result = basicEnquirySchema.validate(testData);
    expect(result.error).toBeDefined();
  });

  it('should not be empty', () => {
    const testData = {};

    const result = basicEnquirySchema.validate(testData);
    expect(result.error).toBeDefined();
  });
});
