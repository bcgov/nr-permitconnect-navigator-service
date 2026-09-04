import { jsonToPrismaInputJson } from '#src/db/utils/utils';

describe('jsonToPrismaInputJson', () => {
  it('maps null to a Prisma JSON null', () => {
    expect(jsonToPrismaInputJson(null)).toBeNull();
  });

  it('passes through valid JSON values unchanged', () => {
    const value = { a: 1, b: [1, 'two', false, null] };
    expect(jsonToPrismaInputJson(value)).toEqual(value);
  });

  it('throws for values with no JSON representation', () => {
    expect(() => jsonToPrismaInputJson(() => undefined)).toThrow('Value is not valid JSON');
    expect(() => jsonToPrismaInputJson(undefined)).toThrow('Value is not valid JSON');
  });

  it('throws for circular references', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(() => jsonToPrismaInputJson(circular)).toThrow('Value is not valid JSON');
  });

  it('throws for values containing BigInt', () => {
    expect(() => jsonToPrismaInputJson({ value: 1n })).toThrow('Value is not valid JSON');
  });
});
