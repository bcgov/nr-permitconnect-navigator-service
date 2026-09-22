import '#src/routes/index';
import { getSpec } from '#src/docs/docs';
import { electrificationProjectStatisticsSchema } from '#src/schemas/response/projectStatistics';
import { schema as permitSchema } from '#src/schemas/request/permit';

vi.mock('config', () => {
  const mock = { has: vi.fn(), get: vi.fn() };
  return { default: mock, ...mock };
});

vi.mock('jwks-rsa', () => ({
  default: vi.fn().mockReturnValue({
    getSigningKey: vi.fn()
  })
}));

// Importing '#src/routes/index' above pulls in every v1 route file, so every openapiRoute() call
// has run and registered its schemas before getSpec() builds the document below - this is what
// actually exercises OpenApiGeneratorV3 against the full registry, unlike routes/v1/docs.test.ts
// which mocks getSpec() entirely.
describe('getSpec', () => {
  it('builds the OpenAPI document from the full route registry without throwing', () => {
    expect(() => getSpec()).not.toThrow();
  });

  it('registers paths and component schemas from every route file', () => {
    const spec = getSpec();

    expect(Object.keys(spec.paths ?? {}).length).toBeGreaterThan(0);
    expect(Object.keys(spec.components?.schemas ?? {})).toEqual(
      expect.arrayContaining(['Permit', 'Contact', 'Problem'])
    );
  });
});

describe('.strict() schemas reject unknown keys', () => {
  it('rejects an extra field on a strict response schema', () => {
    const valid = {
      total_submissions: 1,
      total_submissions_between: 1,
      total_submissions_monthyear: 1,
      total_submissions_assignedto: 1,
      state_new: 1,
      state_inprogress: 1,
      state_delayed: 1,
      state_completed: 1,
      queue_1: 1,
      queue_2: 1,
      queue_3: 1,
      escalation: 1,
      general_enquiry: 1,
      guidance: 1,
      inapplicable: 1,
      status_request: 1,
      multi_permits_needed: 1
    };

    expect(electrificationProjectStatisticsSchema.safeParse(valid).success).toBe(true);
    expect(electrificationProjectStatisticsSchema.safeParse({ ...valid, extraField: 'nope' }).success).toBe(false);
  });

  it('rejects an extra field on a strict request schema', () => {
    const valid = { permitId: '3f9a1b2c-4d5e-4f60-8a1b-2c3d4e5f6071' };

    expect(permitSchema.deletePermit.params.safeParse(valid).success).toBe(true);
    expect(permitSchema.deletePermit.params.safeParse({ ...valid, extraField: 'nope' }).success).toBe(false);
  });
});
