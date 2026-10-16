import type { ResponseBody, Schema } from '@/types';

// Mocks

// Fixtures

// Mount

// Tests

// Type-level assertions, enforced by the typecheck that runs before tests
describe('ResponseBody', () => {
  it('gives the 200 response body', () => {
    expectTypeOf<ResponseBody<'getHousingProject'>>().toEqualTypeOf<Schema<'HousingProject'>>();
  });

  it('gives the 201 response body', () => {
    expectTypeOf<ResponseBody<'submitHousingProjectDraft'>>().toEqualTypeOf<Schema<'HousingProject'>>();
  });

  it('gives undefined for an operation that only returns 204', () => {
    expectTypeOf<ResponseBody<'deleteHousingProject'>>().toBeUndefined();
  });

  it('adds undefined to the body when a 204 is also declared', () => {
    expectTypeOf<ResponseBody<'getHousingProjectPids'>>().toEqualTypeOf<string | undefined>();
  });

  it('gives the union of bodies for a union of ids', () => {
    expectTypeOf<ResponseBody<'getHousingProject' | 'getGeneralProject'>>().toEqualTypeOf<
      Schema<'HousingProject'> | Schema<'GeneralProject'>
    >();
  });
});
