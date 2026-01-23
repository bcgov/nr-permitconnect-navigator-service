import { combineDateTime, isPlainObject, setEmptyStringsToNull, splitDateTime, toKebabCase } from '@/utils/utils';

describe('utils.ts', () => {
  describe('combineDateTime', () => {
    it('returns null when date is null', () => {
      const result = combineDateTime(null, '07:00:00Z');
      expect(result).toBeNull();
    });

    it('returns null when date is empty string (falsy guard)', () => {
      const result = combineDateTime('', '07:00:00Z');
      expect(result).toBeNull();
    });

    it('produces midnight UTC when time is null', () => {
      const result = combineDateTime('2024-01-10', null);

      expect(result).not.toBeNull();
      expect(result!.getFullYear()).toBe(2024);
      expect(result!.getMonth()).toBe(0); // January
      expect(result!.getDate()).toBe(10);
      expect(result!.getHours()).toBe(0);
      expect(result!.getMinutes()).toBe(0);
      expect(result!.getSeconds()).toBe(0);
      expect(result!.getMilliseconds()).toBe(0);
    });

    it('combines date and full time with milliseconds', () => {
      const result = combineDateTime('2024-01-10', '07:30:15.123Z');

      expect(result).not.toBeNull();
      expect(result!.toISOString()).toBe('2024-01-10T07:30:15.123Z');
    });

    it('combines date and time without milliseconds (adds .000Z in ISO output)', () => {
      const result = combineDateTime('2024-01-10', '07:00:00Z');

      expect(result).not.toBeNull();
      expect(result!.toISOString()).toBe('2024-01-10T07:00:00.000Z');
    });
  });

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

  describe('splitDateTime', () => {
    it('returns { date: null, time: null } for undefined', () => {
      const result = splitDateTime(undefined);
      expect(result).toEqual({ date: null, time: null });
    });

    it('returns { date: null, time: null } for null', () => {
      const result = splitDateTime(null);
      expect(result).toEqual({ date: null, time: null });
    });

    it('returns { date: null, time: null } for an invalid Date', () => {
      const invalid = new Date('not-a-real-date');
      const result = splitDateTime(invalid);
      expect(result).toEqual({ date: null, time: null });
    });

    it('treats a midnight Date as date-only (time = null)', () => {
      const d = new Date('2025-01-02T00:00:00.000Z');

      const result = splitDateTime(d);

      expect(result).toEqual({
        date: '2025-01-02',
        time: null
      });
    });

    it('returns date and full time (including millis) when time is not midnight', () => {
      const d = new Date('2025-01-02T15:30:45.123Z');

      const result = splitDateTime(d);

      expect(result).toEqual({
        date: '2025-01-02',
        time: '15:30:45.123Z'
      });
    });
  });

  describe('toKebabCase', () => {
    it('returns the expected kebab case string values', () => {
      expect(toKebabCase('descriptive Variable name')).toEqual('descriptive-variable-name');
      expect(toKebabCase('INTERESTING FILE')).toEqual('interesting-file');
      expect(toKebabCase('abc')).toEqual('abc');
    });

    it('returns blanks if blank provided', () => {
      expect(toKebabCase('')).toEqual('');
    });

    it('returns undefined if undefined provided', () => {
      expect(toKebabCase(undefined)).toEqual(undefined);
    });
  });
});
