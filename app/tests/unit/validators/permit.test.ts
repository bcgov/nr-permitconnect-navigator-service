import { PermitStage, PermitState } from '#src/db/codes/enums';
import { schema } from '#src/validators/permit';

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

describe('permit upsertPermit body schema', () => {
  it('validates when submittedTime is a valid timetz string', () => {
    const body = {
      ...permit(),
      submittedTime: '07:00:00Z'
    };

    const result = schema.upsertPermit.body.safeParse(body);

    expect(result.success).toBe(true);
  });

  it('fails validation when submittedTime is missing Z', () => {
    const body = {
      ...permit(),
      submittedTime: '07:00:00'
    };

    const result = schema.upsertPermit.body.safeParse(body);

    expect(result.success).toBe(false);
    expect(!result.success && result.error.issues[0].message).toContain('Must be a valid UTC time string');
  });
});

describe('permit searchPermits query schema', () => {
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

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(true);
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

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(true);
  });

  it('validates when query is an empty object', () => {
    const query = {};

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(true);
  });

  it('fails validation when dateRange has more than two elements', () => {
    const query = {
      dateRange: ['2024-01-01', '2024-06-01', '2024-12-31']
    };

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('fails validation when dateRange contains non-string values', () => {
    const query = {
      dateRange: [123, 456]
    };

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('validates with valid dateRange', () => {
    const query = {
      dateRange: ['2024-01-01', '2024-12-31'],
      skip: '0',
      take: '50'
    };

    const result = schema.searchPermits.query.safeParse(query);

    expect(result.success).toBe(true);
  });
});
