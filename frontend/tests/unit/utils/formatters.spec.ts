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

    it('strips leading zeros from the day component', () => {
      expect(formatDateOnly('2025-01-05')).toEqual('January 5, 2025');
    });

    it('returns an empty string when value is null', () => {
      expect(formatDateOnly(null)).toEqual('');
    });

    it('returns an empty string when value is undefined', () => {
      expect(formatDateOnly(undefined as unknown as string)).toEqual('');
    });

    it('returns an empty string when value is an empty string', () => {
      expect(formatDateOnly('')).toEqual('');
    });

    it('returns an empty string when value does not match YYYY-MM-DD format', () => {
      expect(formatDateOnly('2025/11/28')).toEqual('');
      expect(formatDateOnly('2025-1-05')).toEqual('');
      expect(formatDateOnly('2025-13-05')).toEqual('');
      expect(formatDateOnly('not-a-date')).toEqual('');
    });

    it('returns leap years correctly', () => {
      expect(formatDateOnly('2024-02-29')).toEqual('February 29, 2024');
      expect(formatDateOnly('2025-02-29')).toEqual(''); // Invalid date
    });

    it('returns empty string for days that do not exist in a specific month', () => {
      expect(formatDateOnly('2025-04-31')).toEqual(''); // April has 30 days
    });

    it('rejects dates with extra time information or ISO formats', () => {
      expect(formatDateOnly('2025-11-28T12:00:00')).toEqual('');
      expect(formatDateOnly('2025-11-28 ')).toEqual('');
    });

    it('handles minimum and maximum valid-ish dates', () => {
      expect(formatDateOnly('0001-01-01')).toEqual('January 1, 0001');
      expect(formatDateOnly('9999-12-31')).toEqual('December 31, 9999');
    });

    it('returns empty string for month 00 or day 00', () => {
      expect(formatDateOnly('2025-00-01')).toEqual('');
      expect(formatDateOnly('2025-01-00')).toEqual('');
    });
  });
});
