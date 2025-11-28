import { formatDate, formatDateFilename, formatDateLong, formatDateOnly } from '@/utils/formatters';

describe('formatters.ts', () => {
  describe('formatDate', () => {
    it('returns the expected date format', () => {
      expect(formatDate(new Date(2023, 10, 1).toISOString())).toEqual('November 1, 2023');
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

  describe('formatDateFilename', () => {
    it('returns the expected filename-friendly format if given a valid date', () => {
      const dateStr = new Date(2023, 10, 1, 0, 0, 0).toISOString();

      expect(formatDateFilename(dateStr)).toEqual('2023-11-01_0000');
    });
  });

  describe('formatDateOnly', () => {
    it('returns the expected date format if given a valid date only string', () => {
      expect(formatDateOnly('2025-11-28')).toEqual('November 28, 2025');
    });
  });
});
