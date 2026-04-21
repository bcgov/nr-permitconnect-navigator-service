import { PermitStage, PermitState } from '../../../src/utils/enums/permit.ts';
import { upsertPermitBodySchema, searchPermitsQuerySchema } from '../../../src/validators/permit.ts';

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

describe('permit searchPermitsQuerySchema', () => {
  it('validates when all query parameters are provided', () => {
    const query = {
      dateRange: ['2024-01-01', '2024-12-31'],
      permitTypeId: '123',
      searchTag: 'test',
      skip: '0',
      sortField: 'submittedDate',
      sortOrder: '1',
      sourceSystemKindId: '456',
      take: '10'
    };

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeUndefined();
  });

  it('validates when all query parameters are null', () => {
    const query = {
      dateRange: null,
      permitTypeId: null,
      searchTag: null,
      skip: null,
      sortField: null,
      sortOrder: null,
      sourceSystemKindId: null,
      take: null
    };

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeUndefined();
  });

  it('validates when query is an empty object', () => {
    const query = {};

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeUndefined();
  });

  it('fails validation when dateRange has more than two elements', () => {
    const query = {
      dateRange: ['2024-01-01', '2024-06-01', '2024-12-31']
    };

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeDefined();
    expect(result.error!.details[0].message).toContain('must contain 2 items');
  });

  it('fails validation when dateRange contains non-string values', () => {
    const query = {
      dateRange: [123, 456]
    };

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeDefined();
    expect(result.error!.details[0].message).toContain('must be a string');
  });

  it('validates with valid dateRange', () => {
    const query = {
      dateRange: ['2024-01-01', '2024-12-31'],
      skip: '0',
      take: '50'
    };

    const result = searchPermitsQuerySchema.validate(query);

    expect(result.error).toBeUndefined();
  });
});
