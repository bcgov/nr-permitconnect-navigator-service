import {
  activityId,
  dateOnlyString,
  email,
  phoneNumber,
  timeTzString,
  uuidv4
} from '../../../src/validators/common.ts';

describe('common validators', () => {
  describe('activityId', () => {
    it('accepts a valid 8-character activityId', () => {
      const { error } = activityId.validate('2DE67F13');
      expect(error).toBeUndefined();
    });

    it('rejects an activityId that is too short', () => {
      const { error } = activityId.validate('ABC123');
      expect(error).toBeDefined();
    });

    it('rejects an activityId that is too long', () => {
      const { error } = activityId.validate('ABCDEFGHI');
      expect(error).toBeDefined();
    });
  });

  describe('dateOnlyString', () => {
    it.each(['2000-01-01', '1999-12-31', '2024-02-29'])('accepts valid past dates: %s', (value) => {
      const { error, value: out } = dateOnlyString.validate(value);
      expect(error).toBeUndefined();
      expect(out).toBe(value);
    });

    it.each(['2025-13-01', '2025-00-10', '2025-01-32', '2025-1-01', 'abcd', '', '2025-01-01T00:00:00Z'])(
      'rejects badly formatted date-only strings: %s',
      (value) => {
        const { error } = dateOnlyString.validate(value);
        expect(error).toBeDefined();
      }
    );

    it('rejects a future date', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const { error } = dateOnlyString.validate(tomorrow);
      expect(error).toBeDefined();
      expect(error?.details[0].type).toBe('date.max');
    });

    it('rejects a syntactically valid but impossible calendar date via date.invalid', () => {
      const { error } = dateOnlyString.validate('2025-02-29');

      expect(error).toBeDefined();
      expect(error?.details[0].type).toBe('date.invalid');
    });
  });

  describe('email', () => {
    it('accepts a valid email address', () => {
      const { error } = email.validate('user@example.com');
      expect(error).toBeUndefined();
    });

    it('rejects an invalid email address', () => {
      const { error } = email.validate('not-an-email');
      expect(error).toBeDefined();
    });

    it('allows empty / undefined when not required in a parent schema', () => {
      // Directly validating undefined is allowed unless .required() is set
      const { error } = email.validate(undefined);
      expect(error).toBeUndefined();
    });
  });

  describe('phoneNumber', () => {
    it('accepts a valid phone number', () => {
      const { error } = phoneNumber.validate('+1 (604) 555-1234');
      expect(error).toBeUndefined();
    });

    it('rejects an invalid phone number', () => {
      const { error } = phoneNumber.validate('not-a-phone');
      expect(error).toBeDefined();
    });

    it('allows undefined when not required in a parent schema', () => {
      const { error } = phoneNumber.validate(undefined);
      expect(error).toBeUndefined();
    });
  });

  describe('timeTzString', () => {
    it.each(['00:00:00Z', '7:05:09Z', '07:00:00Z', '23:59:59Z', '09:30:15.1Z', '09:30:15.123Z', '09:30:15.1234567Z'])(
      'accepts valid timetz: %s',
      (value) => {
        const { error } = timeTzString.validate(value);
        expect(error).toBeUndefined();
      }
    );

    it.each([
      '07:00Z',
      '07:00',
      '07:00:00',
      '24:00:00Z',
      '23:60:00Z',
      '23:59:60Z',
      '07:00:00.12345678Z',
      '07:00:00+01:00',
      '07:00:00-07:30',
      '07:00 UTC',
      'abc'
    ])('rejects invalid timetz: %s', (value) => {
      const { error } = timeTzString.validate(value);
      expect(error).toBeDefined();
      expect(error!.details[0].message).toContain('Must be a valid UTC time string');
    });
  });

  describe('uuidv4', () => {
    it('accepts a valid UUID v4', () => {
      const { error } = uuidv4.validate('68a9a188-4d67-46e3-92a4-b57174354231');
      expect(error).toBeUndefined();
    });

    it('rejects an invalid UUID', () => {
      const { error } = uuidv4.validate('not-a-uuid');
      expect(error).toBeDefined();
    });

    it('allows undefined when not required in a parent schema', () => {
      const { error } = uuidv4.validate(undefined);
      expect(error).toBeUndefined();
    });
  });
});
