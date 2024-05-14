import { appliedPermitsSchema } from '../../../src/validators/appliedPermits';
import { PERMIT_STATUS } from '../../../src/components/constants';

describe('appliedPermitsSchema', () => {
  it('should only accept numbers for permitTypeId', () => {
    const appliedPermits = {
      permitTypeId: '123AC!',
      status: PERMIT_STATUS.NEW,
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should not accept null for permitTypeId', () => {
    const appliedPermits = {
      status: PERMIT_STATUS.APPLIED,
      statusLastVerified: '2021-01-01',
      trackingId: 'test tracking id'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should be a valid schema', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PERMIT_STATUS.COMPLETED,
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });

  it('should only accept one of New, Applied or Completed for status', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: 'Test',
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a valid date for statusLastVerified', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PERMIT_STATUS.APPLIED,
      statusLastVerified: 'not-a-date',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a date lower than current date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PERMIT_STATUS.APPLIED,
      statusLastVerified: new Date(Date.now() + 1000).toISOString(),
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should allow nulls for fields except permit type id', () => {
    const appliedPermits = {
      permitTypeId: 123
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });
});
