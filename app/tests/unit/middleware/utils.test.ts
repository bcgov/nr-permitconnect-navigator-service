import { stripNullCharactersFromString, sanitize } from '../../../src/middleware/utils.ts'; // ⬅️ adjust path if needed

describe('stripNullCharactersFromString', () => {
  it('removes NUL (\\u0000) characters from a string', () => {
    expect(stripNullCharactersFromString('a\u0000b\u0000c')).toBe('abc');
  });

  it('removes NUL written as \\0 (octal) in a literal', () => {
    expect(stripNullCharactersFromString('x\0y')).toBe('xy');
  });

  it('removes NUL written as \\x00 (hex) in a literal', () => {
    expect(stripNullCharactersFromString('x\x00y')).toBe('xy');
  });

  it('removes NUL written as \\u{0} (code point) in a literal', () => {
    expect(stripNullCharactersFromString('x\u{0}y')).toBe('xy');
  });

  it('no-ops when there are no NUL characters', () => {
    const s = 'keep-me';
    expect(stripNullCharactersFromString(s)).toBe('keep-me');
  });

  it('handles multiple adjacent NULs', () => {
    expect(stripNullCharactersFromString('\u0000\u0000A\u0000B\u0000\u0000')).toBe('AB');
  });

  it('handles empty string', () => {
    expect(stripNullCharactersFromString('')).toBe('');
  });
});

describe('sanitize', () => {
  it('sanitizes a plain string (removes NULs)', () => {
    const input = 'hello\u0000world';
    const out = sanitize(input);
    expect(out).toBe('helloworld');
  });

  it('recursively sanitizes nested objects and arrays', () => {
    const payload = {
      id: 1,
      name: 'he\u0000llo',
      flags: { a: true, b: false, c: null },
      arr: ['x', 'y\u0000', { z: '1\u0000' }, ['a\u0000', 'b']],
      nested: { deep: { s: 'A\u0000B' } }
    };

    const out = sanitize(payload) as typeof payload;

    expect(out).toEqual({
      id: 1,
      name: 'hello',
      flags: { a: true, b: false, c: null },
      arr: ['x', 'y', { z: '1' }, ['a', 'b']],
      nested: { deep: { s: 'AB' } }
    });
  });

  it('does not alter numbers/booleans/null/undefined primitives', () => {
    expect(sanitize(123)).toBe(123);
    expect(sanitize(true)).toBe(true);
    expect(sanitize(false)).toBe(false);
    expect(sanitize(null as unknown as string)).toBe(null);
    expect(sanitize(undefined as unknown as string)).toBe(undefined);
  });

  it('mutates arrays in place (same reference), but with values sanitized', () => {
    const arr = ['a\u0000', 'b', 'c\u0000'];
    const originalRef = arr;
    const out = sanitize(arr);
    expect(out).toBe(originalRef); // same reference
    expect(arr).toEqual(['a', 'b', 'c']); // values sanitized
  });

  it('mutates objects in place (same reference), but with values sanitized', () => {
    const obj = { a: 'a\u0000', b: 'b', nested: { c: 'c\u0000' } };
    const originalRef = obj;
    const out = sanitize(obj);
    expect(out).toBe(originalRef); // same reference
    expect(obj).toEqual({ a: 'a', b: 'b', nested: { c: 'c' } });
  });

  it('does not change object keys (only values)', () => {
    const obj: Record<string, string> = { 'ke\u0000y': 'va\u0000l' };
    // Note: your implementation does not sanitize keys; only values are changed.
    const out = sanitize(obj) as typeof obj;
    expect(Object.keys(out)).toEqual(['ke\u0000y']); // key unchanged
    expect(out['ke\u0000y']).toBe('val'); // value sanitized
  });

  it('handles empty array/object', () => {
    const a: unknown[] = [];
    const o: Record<string, unknown> = {};
    expect(sanitize(a)).toBe(a);
    expect(sanitize(o)).toBe(o);
    expect(a).toEqual([]);
    expect(o).toEqual({});
  });

  it('leaves non-plain objects effectively unchanged (e.g., Date)', () => {
    const d = new Date('2020-01-01T00:00:00Z');
    const out = sanitize(d);
    // Object.entries(date) is empty; your code returns the same ref
    expect(out).toBe(d);
    expect((out as Date).toISOString()).toBe('2020-01-01T00:00:00.000Z');
  });

  it('handles mixed NUL notations inside strings within arrays/objects', () => {
    const payload = {
      s1: 'he\0llo',
      s2: 'he\x00llo',
      s3: 'he\u0000llo',
      s4: 'he\u{0}llo',
      arr: ['\0a', '\x00b', '\u0000c', '\u{0}d']
    };
    const out = sanitize(payload) as typeof payload;
    expect(out).toEqual({
      s1: 'hello',
      s2: 'hello',
      s3: 'hello',
      s4: 'hello',
      arr: ['a', 'b', 'c', 'd']
    });
  });

  it('large string without NULs is returned unchanged', () => {
    const big = 'x'.repeat(5000);
    const out = sanitize(big);
    expect(out).toBe(big);
  });
});
