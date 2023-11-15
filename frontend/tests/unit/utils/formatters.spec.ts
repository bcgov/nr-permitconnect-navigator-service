import { formatDate, formatDateLong, toKebabCase } from '@/utils/formatters';

describe('formatters.ts', () => {
  describe('formatDate', () => {
    it('returns the expected date format', () => {
      expect(formatDate(new Date(2023, 10, 1).toISOString())).toEqual('November 1 2023');
    });

    it('returns empty string if given no value', () => {
      expect(formatDate('')).toEqual('');
    });

    it('returns empty string if given invalid format', () => {
      expect(formatDate('asd')).toEqual('');
    });
  });

  describe('formatDateLong', () => {
    it('returns the expected date format', () => {
      expect(formatDateLong(new Date(2023, 10, 1, 0, 0, 0).toISOString())).toEqual('November 1 2023, 12:00:00 AM');
    });
  });

  describe('toKebabCase', () => {
    it('returns the expected UUID values', () => {
      expect(toKebabCase('descriptive Variable name')).toEqual('descriptive-variable-name');
      expect(toKebabCase('INTERESTING FILE')).toEqual('interesting-file');
      expect(toKebabCase('abc')).toEqual('abc');
    });

    it('returns blanks if blank provided', () => {
      expect(toKebabCase('')).toEqual('');
      expect(toKebabCase(null)).toEqual('');
    });
  });
});
