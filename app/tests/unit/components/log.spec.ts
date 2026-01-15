import config from 'config';
import type { Logger } from 'winston';

import getLogger, { httpLogger } from '../../../src/utils/log.ts';

describe('getLogger', () => {
  const assertLogger = (log: Logger): void => {
    expect(log).toBeTruthy();
    expect(typeof log).toBe('object');
    expect(typeof log.pipe).toBe('function');
    expect(log.exitOnError).toBeFalsy();
    expect(log.format).toBeTruthy();
    expect(log.level).toBe(config.get('server.logLevel'));
    expect(log.transports).toHaveLength(1);
  };

  it('should return a winston logger', () => {
    const result = getLogger(undefined);
    assertLogger(result);
  });

  it('should return a child winston logger with metadata overrides', () => {
    const result = getLogger('test');
    assertLogger(result);
  });
});

describe('httpLogger', () => {
  it('should return a winston middleware function', () => {
    const result = httpLogger;

    expect(result).toBeTruthy();
    expect(typeof result).toBe('function');
    expect(result.length).toBe(3);
  });
});
