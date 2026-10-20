import { PermitStage } from '#src/db/codes/enums';
import { appliedPermit, intakePermits } from '#src/schemas/request/appliedPermit';

describe('appliedPermitsSchema', () => {
  it('should only accept numbers for permitTypeId', () => {
    const appliedPermits = {
      permitTypeId: '123AC!',
      submittedDate: '2021-01-01'
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(false);
  });

  it('should not accept null for permitTypeId', () => {
    const appliedPermits = {
      submittedDate: '2021-01-01'
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(false);
  });

  it('should be a valid schema', () => {
    const appliedPermits = {
      permitTypeId: 123,
      permitTracking: [{ trackingId: '123' }],
      submittedDate: '2021-01-01'
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(true);
  });

  it('should reject stage, which intake always sets itself', () => {
    const appliedPermits = {
      permitTypeId: 123,
      stage: PermitStage.APPLICATION_SUBMISSION
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(false);
  });

  it('should only accept a valid date for submitted date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      submittedDate: 'not-a-date'
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(false);
  });

  it('should only accept a date lower than current date', () => {
    const appliedPermits = {
      permitTypeId: 123,
      submittedDate: new Date(Date.now() + 1000 * 60 * 60).toISOString()
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(false);
  });

  it('should allow nulls for fields except permit type id', () => {
    const appliedPermits = {
      permitTypeId: 123
    };
    const result = appliedPermit.safeParse(appliedPermits);
    expect(result.success).toBe(true);
  });
});

describe('intakePermits', () => {
  it('rejects applied permits when hasAppliedProvincialPermits is No', () => {
    const result = intakePermits.safeParse({
      hasAppliedProvincialPermits: 'No',
      appliedPermits: [{ permitTypeId: 1 }]
    });
    expect(result.success).toBe(false);
  });

  it.each(['Yes', 'Unsure'])('accepts applied permits when hasAppliedProvincialPermits is %s', (answer) => {
    const result = intakePermits.safeParse({
      hasAppliedProvincialPermits: answer,
      appliedPermits: [{ permitTypeId: 1 }]
    });
    expect(result.success).toBe(true);
  });

  it('accepts No with no applied permits', () => {
    const result = intakePermits.safeParse({ hasAppliedProvincialPermits: 'No', appliedPermits: [] });
    expect(result.success).toBe(true);
  });
});
