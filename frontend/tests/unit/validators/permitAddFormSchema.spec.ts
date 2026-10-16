import { runSchema } from '../../helpers';
import { permitAddFormSchema } from '@/validators/permitAddFormSchema';

// Mocks

// Fixtures

// Mount

// Tests

describe('permitAddFormSchema', () => {
  it('accepts permits and casts their submitted dates', async () => {
    const permit = { permitTypeId: 1, submittedDate: '2020-01-01', permitTracking: [{ trackingId: 'T' }] };

    expect(await runSchema(permitAddFormSchema, { permits: { appliedPermits: [permit] } })).toEqual({
      value: { permits: { appliedPermits: [{ ...permit, submittedDate: new Date('2020-01-01T00:00') }] } },
      errors: {}
    });
  });

  it('requires at least one permit', async () => {
    const errors = { 'permits.appliedPermits': 'At least one permit is required' };

    expect((await runSchema(permitAddFormSchema, {})).errors).toEqual(errors);
    expect((await runSchema(permitAddFormSchema, { permits: { appliedPermits: [] } })).errors).toEqual(errors);
  });

  it('requires a permit type on each permit', async () => {
    expect((await runSchema(permitAddFormSchema, { permits: { appliedPermits: [{}] } })).errors).toEqual({
      'permits.appliedPermits.0.permitTypeId': 'Permit type is a required field'
    });
  });
});
