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

  it('ignores error responses, so an operation with no success body gives never', () => {
    expectTypeOf<ResponseBody<'deleteHousingProject'>>().toBeNever();
  });

  it('gives the union of bodies for a union of ids', () => {
    expectTypeOf<ResponseBody<'getHousingProject' | 'getGeneralProject'>>().toEqualTypeOf<
      Schema<'HousingProject'> | Schema<'GeneralProject'>
    >();
  });
});
