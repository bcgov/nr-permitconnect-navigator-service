import { BasicResponse } from '../../../src/utils/enums/application.ts';
import { permits } from '../../../src/validators/permits.ts';

describe('permitsSchema', () => {
  it('should validate when hasAppliedProvincialPermits is YES', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.YES
    };

    const result = permits.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should validate when hasAppliedProvincialPermits is UNSURE', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.UNSURE
    };

    const result = permits.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should not validate when hasAppliedProvincialPermits is NO', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.NO
    };

    const result = permits.validate(data);
    expect(result.error).toBeUndefined();
  });
});
