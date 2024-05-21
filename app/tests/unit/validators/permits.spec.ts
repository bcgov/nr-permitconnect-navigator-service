import { YES_NO, YES_NO_UNSURE } from '../../../src/components/constants';
import { permitsSchema } from '../../../src/validators/permits';

describe('permitsSchema', () => {
  it('should validate checkProvincialPermits when hasAppliedProvincialPermits is YES', () => {
    const data = {
      hasAppliedProvincialPermits: YES_NO_UNSURE.YES,
      checkProvincialPermits: YES_NO.YES
    };

    const result = permitsSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should validate checkProvincialPermits when hasAppliedProvincialPermits is UNSURE', () => {
    const data = {
      hasAppliedProvincialPermits: YES_NO_UNSURE.UNSURE,
      checkProvincialPermits: YES_NO.YES
    };

    const result = permitsSchema.validate(data);
    expect(result.error).toBeUndefined();
  });

  it('should not validate checkProvincialPermits when hasAppliedProvincialPermits is NO', () => {
    const data = {
      hasAppliedProvincialPermits: YES_NO_UNSURE.NO,
      checkProvincialPermits: YES_NO.YES
    };

    const result = permitsSchema.validate(data);
    expect(result.error).toBeDefined();
  });
});
