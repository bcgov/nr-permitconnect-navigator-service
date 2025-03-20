import { PermitStatus } from '../../../src/utils/enums/permit';
import { appliedPermit } from '../../../src/validators/appliedPermit';

describe('appliedPermitsSchema', () => {
  it('should only accept numbers for permitTypeId', () => {
    const appliedPermits = {
      permitTypeId: '123AC!',
      status: PermitStatus.NEW,
      submittedDate: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should not accept null for permitTypeId', () => {
    const appliedPermits = {
      status: PermitStatus.APPLIED,
      submittedDate: '2021-01-01',
      trackingId: 'test tracking id'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should be a valid schema', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PermitStatus.COMPLETED,
      submittedDate: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });

  it('should only accept one of New, Applied or Completed for status', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: 'Test',
      submittedDate: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a valid date for submitted date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PermitStatus.APPLIED,
      submittedDate: 'not-a-date',
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a date lower than current date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      status: PermitStatus.APPLIED,
      submittedDate: new Date(Date.now() + 1000).toISOString(),
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should allow nulls for fields except permit type id', () => {
    const appliedPermits = {
      permitTypeId: 123
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });
});
