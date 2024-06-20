import { BasicResponse } from '../../../src/utils/enums/application';
import { permits } from '../../../src/validators/permits';

describe('permitsSchema', () => {
  it('should validate checkProvincialPermits when hasAppliedProvincialPermits is YES', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.YES,
      checkProvincialPermits: BasicResponse.YES
    };

    const result = permits.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should validate checkProvincialPermits when hasAppliedProvincialPermits is UNSURE', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.UNSURE,
      checkProvincialPermits: BasicResponse.YES
    };

    const result = permits.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should not validate checkProvincialPermits when hasAppliedProvincialPermits is NO', () => {
    const data = {
      hasAppliedProvincialPermits: BasicResponse.NO,
      checkProvincialPermits: BasicResponse.YES
    };

    const result = permits.validate(data);
    expect(result.error).toBeDefined();
  });
});
