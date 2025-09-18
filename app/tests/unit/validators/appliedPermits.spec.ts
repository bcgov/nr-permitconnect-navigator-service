import { PermitStage } from '../../../src/utils/enums/permit';
import { appliedPermit } from '../../../src/validators/appliedPermit';

describe('appliedPermitsSchema', () => {
  it('should only accept numbers for permitTypeId', () => {
    const appliedPermits = {
      permitTypeId: '123AC!',
      stage: PermitStage.PRE_SUBMISSION,
      submittedDate: '2021-01-01',
      trackingId: 'test'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should not accept null for permitTypeId', () => {
    const appliedPermits = {
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: '2021-01-01',
      trackingId: 'test tracking id'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should be a valid schema', () => {
    const appliedPermits = {
      permitTypeId: 123,
      stage: PermitStage.POST_DECISION,
      permitTracking: [{ trackingId: '123' }],
      submittedDate: '2021-01-01'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeUndefined();
  });

  it('should only accept one of New, Applied or Completed for stage', () => {
    const appliedPermits = {
      permitTypeId: 123,
      stage: 'Test',
      submittedDate: '2021-01-01'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a valid date for submitted date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: 'not-a-date'
    };
    const result = appliedPermit.validate(appliedPermits);
    expect(result.error).toBeDefined();
  });

  it('should only accept a date lower than current date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      stage: PermitStage.APPLICATION_SUBMISSION,
      submittedDate: new Date(Date.now() + 1000).toISOString()
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
