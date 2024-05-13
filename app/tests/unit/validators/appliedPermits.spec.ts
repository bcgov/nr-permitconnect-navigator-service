import { appliedPermitsSchema } from '../../../src/validators/appliedPermits';
import { PERMIT_STATUS } from '../../../src/components/constants';

describe('appliedPermitsSchema', () => {
  it('permitTypeId should only accept number', () => {
    const appliedPermits = {
      permitTypeId: '123AC!',
      status: PERMIT_STATUS.NEW,
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('permitTypeId is required', () => {
    const appliedPermits = {
      status: PERMIT_STATUS.APPLIED,
      statusLastVerified: '2021-01-01',
      trackingId: 'test tracking id'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('Should be a valid schema', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PERMIT_STATUS.COMPLETED,
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });

  it('status should be one of New, Applied or Completed', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: 'Test',
      statusLastVerified: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('statusLastVerified should be a valid date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PERMIT_STATUS.APPLIED,
      statusLastVerified: 'not-a-date',
      trackingId: 'test'
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('Should allow nulls for fields except permit type id', () => {
    const appliedPermits = {
      permitTypeId: 123
    };
    const result = appliedPermitsSchema.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });
});
