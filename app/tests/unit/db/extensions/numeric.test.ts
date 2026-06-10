import numericTransform from '../../../../src/db/extensions/numeric.ts';
import { captureExtension } from './captureExtension.ts';

const ext = captureExtension(numericTransform);

describe('numeric extension', () => {
  it('exposes a compute function on document.filesize', () => {
    expect(typeof ext.result.document.filesize.compute).toBe('function');
  });

  it('coerces a bigint filesize into a regular number', () => {
    const result = ext.result.document.filesize.compute({ filesize: 1024n });
    expect(result).toBe(1024);
    expect(typeof result).toBe('number');
  });

  it('handles a zero bigint', () => {
    expect(ext.result.document.filesize.compute({ filesize: 0n })).toBe(0);
  });
});
