import { basicSchema } from '../../../src/validators/basic';
import { YES_NO } from '../../../src/components/constants';

describe('basicSchema', () => {
  it('should validate when isDevelopedByCompanyOrOrg and isDevelopedInBC are valid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.YES,
      registeredName: 'My Company'
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when isDevelopedByCompanyOrOrg is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: 'invalid',
      isDevelopedInBC: YES_NO.YES,
      registeredName: 'My Company'
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is invalid', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: 'invalid'
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should throw an error when isDevelopedInBC is YES but registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.YES
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeDefined();
  });

  it('should not throw an error when isDevelopedInBC is NO and registeredName is not provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.NO
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should throw an error when isDevelopedInBC is NO but registeredName is provided', () => {
    const data = {
      isDevelopedByCompanyOrOrg: YES_NO.YES,
      isDevelopedInBC: YES_NO.NO,
      registeredName: 'My Company'
    };

    const result = basicSchema.validate(data);
    expect(result.error).toBeDefined();
  });
});
