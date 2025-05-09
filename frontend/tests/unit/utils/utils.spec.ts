import { isPlainObject, setEmptyStringsToNull } from '@/utils/utils';

describe('utils.ts', () => {
  describe('setEmptyStringsToNull', () => {
    it('returns null when given an empty string', () => {
      expect(setEmptyStringsToNull('')).toBeNull();
    });

    it('leaves non-empty strings unchanged', () => {
      expect(setEmptyStringsToNull('hello')).toEqual('hello');
    });

    it('leaves numbers and booleans unchanged', () => {
      expect(setEmptyStringsToNull(0)).toEqual(0);
      expect(setEmptyStringsToNull(123)).toEqual(123);
      expect(setEmptyStringsToNull(false)).toBe(false);
      expect(setEmptyStringsToNull(true)).toBe(true);
    });

    it('returns null when given null', () => {
      expect(setEmptyStringsToNull(null)).toBeNull();
    });

    it('converts top-level empty strings in an object to null', () => {
      const input = { a: '', b: 'foo', c: 0 };
      const expected = { a: null, b: 'foo', c: 0 };
      expect(setEmptyStringsToNull(input)).toEqual(expected);
    });

    it('recursively converts nested empty strings in objects', () => {
      const input = {
        level1: '',
        nested: {
          level2: '',
          deeper: {
            level3: 'bar'
          }
        }
      };
      const expected = {
        level1: null,
        nested: {
          level2: null,
          deeper: {
            level3: 'bar'
          }
        }
      };
      expect(setEmptyStringsToNull(input)).toEqual(expected);
    });

    it('recursively converts empty strings inside arrays', () => {
      const input = ['', 'foo', ['', { x: '' }]];
      const expected = [null, 'foo', [null, { x: null }]];
      expect(setEmptyStringsToNull(input)).toEqual(expected);
    });

    it('does not mutate the original data', () => {
      const original = { foo: '' };
      const copy = JSON.parse(JSON.stringify(original));
      const result = setEmptyStringsToNull(original);
      expect(original).toEqual(copy);
      expect(result).toEqual({ foo: null });
    });

    it('leaves Date instances untouched', () => {
      const d = new Date('2025-05-08T10:00:00Z');
      expect(setEmptyStringsToNull(d)).toBe(d);
    });
  });

  describe('isPlainObject', () => {
    it('returns true for a plain object literal', () => {
      expect(isPlainObject({ foo: 1 })).toBe(true);
    });

    it('returns false for arrays', () => {
      expect(isPlainObject(['a', 'b'])).toBe(false);
    });

    it('returns false for Date objects', () => {
      expect(isPlainObject(new Date())).toBe(false);
    });

    it('returns false for Map and Set', () => {
      expect(isPlainObject(new Map())).toBe(false);
      expect(isPlainObject(new Set())).toBe(false);
    });

    it('returns false for class instances', () => {
      class Person {
        constructor(public name: string) {}
      }
      expect(isPlainObject(new Person('Alice'))).toBe(false);
    });

    it('returns false for RegExp instances', () => {
      const re = /foo/i;
      expect(isPlainObject(re)).toBe(false);
    });
  });
});
