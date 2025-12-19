import { PermitStage, PermitState } from '../../../src/utils/enums/permit.ts';
import { upsertPermitBodySchema } from '../../../src/validators/permit.ts';

const permit = () => ({
  permitId: null,
  permitTypeId: 1,
  activityId: 'ACTI1234',
  issuedPermitId: null,
  permitTracking: [],
  needed: 'Under Investigation',
  state: PermitState.IN_PROGRESS,
  stage: PermitStage.APPLICATION_SUBMISSION,
  submittedDate: '2024-01-01',
  submittedTime: null,
  decisionDate: null,
  decisionTime: null,
  statusLastChanged: null,
  statusLastChangedTime: null,
  statusLastVerified: null,
  statusLastVerifiedTime: null,
  createdAt: null,
  createdBy: null,
  updatedAt: null,
  updatedBy: null,
  deletedAt: null,
  deletedBy: null
});

describe('permit upsertPermitBodySchema', () => {
  it('validates when submittedTime is a valid timetz string', () => {
    const body = {
      ...permit(),
      submittedTime: '07:00:00Z'
    };

    const result = upsertPermitBodySchema.validate(body);

    expect(result.error).toBeUndefined();
  });

  it('fails validation when submittedTime is missing Z', () => {
    const body = {
      ...permit(),
      submittedTime: '07:00:00'
    };

    const result = upsertPermitBodySchema.validate(body);

    expect(result.error).toBeDefined();
    expect(result.error!.details[0].message).toContain('Must be a valid UTC time string');
  });
});
