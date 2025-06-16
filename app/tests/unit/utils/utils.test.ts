import { isRecord } from '../../../src/utils/utils';

describe('isRecord', () => {
  it('should return true for a plain object', () => {
    const obj = { key: 'value' };
    expect(isRecord(obj)).toBe(true);
  });

  it('should return false for an array', () => {
    const arr = [1, 2, 3];
    expect(isRecord(arr)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isRecord(null)).toBe(false);
  });

  it('should return false for a string', () => {
    const str = 'not an object';
    expect(isRecord(str)).toBe(false);
  });

  it('should return false for a number', () => {
    const num = 42;
    expect(isRecord(num)).toBe(false);
  });

  it('should return false for a function', () => {
    const func = () => {};
    expect(isRecord(func)).toBe(false);
  });
});
