import config from 'config';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { validate, version } from 'uuid';

import { AuthType, IdentityProvider, Initiative } from '../../../src/utils/enums/application.ts';
import * as utils from '../../../src/utils/utils.ts';

import type { JwtPayload } from 'jsonwebtoken';

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn()
}));

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  statSync: jest.fn()
}));

jest.mock('../../../src/utils/log', () => ({
  getLogger: () => ({ warn: jest.fn(), info: jest.fn(), error: jest.fn() })
}));

jest.mock('uuid', () => ({
  validate: jest.fn(),
  version: jest.fn()
}));

const TOKEN_PAYLOAD: JwtPayload = {
  sub: '12345678-90ab-cdef-1234-567890abcdef',
  identity_provider: 'idir',
  idir_username: 'alice.smith',
  email: 'alice.smith@example.com',
  given_name: 'Alice',
  family_name: 'Smith',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000)
};

const CURRENT_CONTEXT = {
  authType: AuthType.BEARER,
  bearerToken: 'some-bearer-token',
  initiative: Initiative.PCNS,
  tokenPayload: TOKEN_PAYLOAD,
  userId: '12345678-90ab-cdef-1234-567890abcdef'
};

const IDP_LIST = [
  {
    idp: IdentityProvider.IDIR,
    kind: 'idir',
    username: 'idir_username'
  },
  {
    idp: IdentityProvider.BCEID,
    kind: 'bceidbasic',
    username: 'bceid_username'
  },
  {
    idp: IdentityProvider.BCEIDBUSINESS,
    kind: 'bceidbusiness',
    username: 'bceid_username'
  }
];

describe('utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (existsSync as jest.Mock).mockReset();
    (readFileSync as jest.Mock).mockReset();
    (statSync as jest.Mock).mockReset();
    (config.get as jest.Mock).mockReset();
    (config.has as jest.Mock).mockReset();
  });

  describe('addDashesToUuid', () => {
    it('inserts dashes and lowercases for 32-hex strings', () => {
      const raw = 'AABBCCDDEEFF00112233445566778899';
      expect(utils.addDashesToUuid(raw)).toBe('aabbccdd-eeff-0011-2233-445566778899');
    });
    it('returns original if not length 32', () => {
      expect(utils.addDashesToUuid('123')).toBe('123');
    });
  });

  describe('camelCaseToTitleCase', () => {
    it('returns null for null', () => {
      expect(utils.camelCaseToTitleCase(null)).toBeNull();
    });
    it('handles empty string', () => {
      expect(utils.camelCaseToTitleCase('')).toBe('');
    });
    it('adds spaces before capitals and title-cases first char', () => {
      expect(utils.camelCaseToTitleCase('helloWorldThing')).toBe('Hello World Thing');
    });
  });

  describe('combineDateTime', () => {
    it('returns undefined when both date and time are undefined/null', () => {
      expect(utils.combineDateTime(undefined, undefined)).toBeUndefined();
      expect(utils.combineDateTime(null, null)).toBeUndefined();
    });

    it('returns undefined when time is provided but date is missing', () => {
      const timeOnly = '12:34:56.000Z';
      expect(utils.combineDateTime(undefined, timeOnly)).toBeUndefined();
      expect(utils.combineDateTime(null, timeOnly)).toBeUndefined();
    });

    it('combines date and time using UTC fields', () => {
      const date = '2025-05-01';
      const time = '23:59:30.250Z';

      const combined = utils.combineDateTime(date, time);

      expect(combined).toBeInstanceOf(Date);
      expect(combined!.toISOString()).toBe('2025-05-01T23:59:30.250Z');
    });

    it('uses midnight when time is omitted', () => {
      const date = '2025-08-15';

      const combined = utils.combineDateTime(date, undefined);

      expect(combined).toBeInstanceOf(Date);
      expect(combined!.toISOString()).toBe('2025-08-15T00:00:00.000Z');
    });
  });

  describe('compareDates', () => {
    const older = new Date('2025-01-01T00:00:00.000Z');
    const newer = new Date('2025-01-02T00:00:00.000Z');

    it('returns 0 for equal dates', () => {
      expect(utils.compareDates(older, new Date(older))).toBe(0);
    });

    it('sorts ascending by default (oldest to newest)', () => {
      expect(utils.compareDates(older, newer)).toBeLessThan(0);
      expect(utils.compareDates(newer, older)).toBeGreaterThan(0);
    });

    it('treats undefined as the oldest value', () => {
      expect(utils.compareDates(undefined, newer)).toBeLessThan(0);
      expect(utils.compareDates(newer, undefined)).toBeGreaterThan(0);
      expect(utils.compareDates(undefined, undefined)).toBe(0);
    });

    it('sorts descending when desc=true (newest to oldest)', () => {
      expect(utils.compareDates(older, newer, true)).toBeGreaterThan(0);
      expect(utils.compareDates(newer, older, true)).toBeLessThan(0);
    });

    it('in descending order, undefined still counts as oldest (comes last)', () => {
      expect(utils.compareDates(undefined, newer, true)).toBeGreaterThan(0);
      expect(utils.compareDates(newer, undefined, true)).toBeLessThan(0);
    });
  });

  describe('formatDateOnly', () => {
    it('returns the expected date format if given a valid date only string', () => {
      expect(utils.formatDateOnly('2025-11-28')).toEqual('November 28, 2025');
    });

    it('strips leading zeros from the day component', () => {
      expect(utils.formatDateOnly('2025-01-05')).toEqual('January 5, 2025');
    });

    it('returns an empty string when value is null', () => {
      expect(utils.formatDateOnly(null)).toEqual('');
    });

    it('returns an empty string when value is undefined', () => {
      expect(utils.formatDateOnly(undefined as unknown as string)).toEqual('');
    });

    it('returns an empty string when value is an empty string', () => {
      expect(utils.formatDateOnly('')).toEqual('');
    });

    it('returns an empty string when value does not match YYYY-MM-DD format', () => {
      expect(utils.formatDateOnly('2025/11/28')).toEqual('');
      expect(utils.formatDateOnly('2025-1-05')).toEqual('');
      expect(utils.formatDateOnly('2025-13-05')).toEqual('');
      expect(utils.formatDateOnly('not-a-date')).toEqual('');
    });
  });

  describe('getGitRevision', () => {
    const mockStat = (isFile: boolean) => ({
      isFile: () => isFile
    });

    it('returns the GIT_COMMIT environment variable if set', () => {
      process.env.GIT_COMMIT = 'envhash123';
      expect(utils.getGitRevision()).toBe('envhash123');
      delete process.env.GIT_COMMIT;
    });

    it('returns the HEAD hash if HEAD is detached', () => {
      (existsSync as jest.Mock).mockImplementation((path: string) => {
        // .git and HEAD exist
        return path.endsWith('.git') || path.endsWith('HEAD');
      });
      (statSync as jest.Mock).mockReturnValue(mockStat(false)); // .git is a directory
      (readFileSync as jest.Mock).mockImplementation((path: string) => {
        if (path.endsWith('HEAD')) return 'abcdef1234567890\n';
        return '';
      });

      expect(utils.getGitRevision()).toBe('abcdef1234567890');
    });

    it('returns the commit hash from ref file if HEAD points to a ref', () => {
      (existsSync as jest.Mock).mockImplementation((path: string) => {
        // .git, HEAD, and ref exist
        return (
          path.endsWith('.git') ||
          path.endsWith('HEAD') ||
          path.endsWith('refs/heads/main') ||
          path.endsWith('refs\\heads\\main')
        );
      });
      (statSync as jest.Mock).mockReturnValue(mockStat(false)); // .git is a directory
      (readFileSync as jest.Mock).mockImplementation((path: string) => {
        if (path.endsWith('HEAD')) return 'ref: refs/heads/main\n';
        if (path.endsWith('refs/heads/main') || path.endsWith('refs\\heads\\main')) return '1234567890abcdef\n';
        return '';
      });

      expect(utils.getGitRevision()).toBe('1234567890abcdef');
    });

    it('returns the commit hash from packed-refs if ref file does not exist', () => {
      (existsSync as jest.Mock).mockImplementation((path: string) => {
        // .git, HEAD, packed-refs exist, but not the ref file
        return path.endsWith('.git') || path.endsWith('HEAD') || path.endsWith('packed-refs');
      });
      (statSync as jest.Mock).mockReturnValue(mockStat(false)); // .git is a directory
      (readFileSync as jest.Mock).mockImplementation((path: string) => {
        if (path.endsWith('HEAD')) return 'ref: refs/heads/main\n';
        if (path.endsWith('packed-refs')) return 'fedcba9876543210 refs/heads/main\n';
        return '';
      });

      expect(utils.getGitRevision()).toBe('fedcba9876543210');
    });

    it('returns undefined if ref file does not exist', () => {
      (existsSync as jest.Mock).mockImplementation((path: string) => {
        // .git, HEAD, packed-refs exist, but not the ref file
        return path.endsWith('.git') || path.endsWith('HEAD') || path.endsWith('packed-refs');
      });
      (statSync as jest.Mock).mockReturnValue(mockStat(false)); // .git is a directory
      (readFileSync as jest.Mock).mockImplementation((path: string) => {
        if (path.endsWith('HEAD')) return 'ref: refs/heads/main\n';
        return '';
      });

      expect(utils.getGitRevision()).toBeUndefined();
    });

    it('returns undefined if .git does not exist', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      expect(utils.getGitRevision()).toBeUndefined();
    });

    it('returns undefined and logs warning if an error is thrown', () => {
      (existsSync as jest.Mock).mockImplementation(() => {
        throw new Error('fs error');
      });

      expect(utils.getGitRevision()).toBeUndefined();
    });

    it('resolves .git as a file (worktree/submodule) and reads gitdir', () => {
      (existsSync as jest.Mock).mockImplementation((path: string) => {
        // .git file, HEAD, and ref exist
        return (
          path.endsWith('.git') ||
          path.endsWith('HEAD') ||
          path.endsWith('refs/heads/feature') ||
          path.endsWith('refs\\heads\\feature')
        );
      });
      (statSync as jest.Mock).mockImplementation((path: string) => {
        // .git is a file
        return mockStat(path.endsWith('.git'));
      });
      (readFileSync as jest.Mock).mockImplementation((path: string) => {
        if (path.endsWith('.git')) return 'gitdir: .git/worktrees/feature\n';
        if (path.endsWith('HEAD')) return 'ref: refs/heads/feature\n';
        if (path.endsWith('refs/heads/feature') || path.endsWith('refs\\heads\\feature')) return 'cafebabe12345678\n';
        return '';
      });

      expect(utils.getGitRevision()).toBe('cafebabe12345678');
    });
  });

  describe('getCurrentSubject', () => {
    it('returns sub from token', () => {
      expect(utils.getCurrentSubject(CURRENT_CONTEXT)).toBe('12345678-90ab-cdef-1234-567890abcdef');
    });
    it('returns default when missing', () => {
      expect(utils.getCurrentSubject(undefined, 'default')).toBe('default');
    });
  });

  describe('getCurrentUsername', () => {
    beforeEach(() => {
      (existsSync as jest.Mock).mockReset();
      (readFileSync as jest.Mock).mockReset();
    });

    it('extracts username based on idp mapping', () => {
      (existsSync as jest.Mock).mockImplementation((p: string) => String(p).endsWith('idplist-local.json'));
      (readFileSync as jest.Mock).mockImplementation((p: string, enc: string) => {
        expect(enc).toBe('utf8');
        return JSON.stringify(IDP_LIST);
      });

      expect(utils.getCurrentUsername(CURRENT_CONTEXT)).toBe('alice.smith');
    });

    it('returns undefined when idp mapping not found', () => {
      (existsSync as jest.Mock).mockImplementation((p: string) => String(p).endsWith('idplist-local.json'));
      (readFileSync as jest.Mock).mockImplementation((p: string, enc: string) => {
        expect(enc).toBe('utf8');
        return JSON.stringify([
          {
            idp: IdentityProvider.BCEID,
            kind: 'bceidbasic',
            username: 'bceid_username'
          }
        ]);
      });
      expect(utils.getCurrentUsername(CURRENT_CONTEXT)).toBeUndefined();
    });

    it('returns undefined when no current context', () => {
      expect(utils.getCurrentUsername(undefined)).toBeUndefined();
    });
  });

  describe('isTruthy', () => {
    it('passes through undefined', () => {
      expect(utils.isTruthy(undefined as unknown)).toBeUndefined();
    });
    it('recognizes true and 1', () => {
      expect(utils.isTruthy(true)).toBe(true);
      expect(utils.isTruthy(1)).toBe(true);
    });
    it('recognizes common true strings (case-insensitive)', () => {
      expect(utils.isTruthy('true')).toBe(true);
      expect(utils.isTruthy('T')).toBe(true);
      expect(utils.isTruthy('Yes')).toBe(true);
      expect(utils.isTruthy('y')).toBe(true);
      expect(utils.isTruthy('1')).toBe(true);
    });
    it('returns false otherwise', () => {
      expect(utils.isTruthy(false)).toBe(false);
      expect(utils.isTruthy(0)).toBe(false);
      expect(utils.isTruthy('no')).toBe(false);
      expect(utils.isTruthy('0')).toBe(false);
      expect(utils.isTruthy(null)).toBe(false);
    });
  });

  describe('mixedQueryToArray', () => {
    it('returns undefined for falsy', () => {
      expect(utils.mixedQueryToArray(undefined)).toBeUndefined();
      expect(utils.mixedQueryToArray('')).toBeUndefined();
    });
    it('parses comma strings and dedupes', () => {
      expect(utils.mixedQueryToArray('a, b, a ,c')).toEqual(['a', 'b', 'c']);
    });
    it('handles string[] and empties -> undefined when all empty', () => {
      expect(utils.mixedQueryToArray(['a,b', 'b , c'])).toEqual(['a', 'b', 'c']);
    });
    it('handles a comma-separated string with duplicates and extra spaces', () => {
      expect(utils.mixedQueryToArray('apple, banana,apple ,  cherry')).toEqual(['apple', 'banana', 'cherry']);
    });
  });

  describe('parseCSV', () => {
    it('splits and trims', () => {
      expect(utils.parseCSV('a, b ,  c  ')).toEqual(['a', 'b', 'c']);
    });
    it('handles single token', () => {
      expect(utils.parseCSV('abc')).toEqual(['abc']);
    });
    it('keeps empties if present (mixedQueryToArray filters later)', () => {
      expect(utils.parseCSV('a,,b')).toEqual(['a', '', 'b']);
    });
  });

  describe('partition', () => {
    it('partitions by predicate', () => {
      const arr = [1, 2, 3, 4, 5];
      const [truthy, falsy] = utils.partition(arr, (v) => v % 2 === 0);
      expect(truthy).toEqual([2, 4]);
      expect(falsy).toEqual([1, 3, 5]);
    });
    it('handles empty array', () => {
      const [t, f] = utils.partition<number>([], () => true);
      expect(t).toEqual([]);
      expect(f).toEqual([]);
    });
  });

  describe('parseIdentityKeyClaims', () => {
    it('returns configured claims + sub (dedup not enforced by code)', () => {
      (config.has as jest.Mock).mockReturnValueOnce(true);
      (config.get as jest.Mock).mockReturnValueOnce('idir_username,github_username');
      expect(utils.parseIdentityKeyClaims()).toEqual(['idir_username', 'github_username', 'sub']);
    });
    it('returns only sub when not configured', () => {
      (config.has as jest.Mock).mockReturnValueOnce(false);
      expect(utils.parseIdentityKeyClaims()).toEqual(['sub']);
    });
  });

  describe('readIdpList', () => {
    beforeEach(() => {
      (existsSync as jest.Mock).mockReset();
      (readFileSync as jest.Mock).mockReset();
    });

    it('prefers override idplist-local.json', () => {
      (existsSync as jest.Mock).mockImplementation((p: string) => ('' + p).endsWith('idplist-local.json'));
      (readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([{ idp: 'idir' }]));
      expect(utils.readIdpList()).toEqual([{ idp: 'idir' }]);
    });

    it('falls back to idplist-default.json', () => {
      (existsSync as jest.Mock).mockImplementation((p: string) => ('' + p).endsWith('idplist-default.json'));
      (readFileSync as jest.Mock).mockReturnValueOnce(JSON.stringify([{ idp: 'github' }]));
      expect(utils.readIdpList()).toEqual([{ idp: 'github' }]);
    });

    it('returns [] when neither exists', () => {
      (existsSync as jest.Mock).mockReturnValueOnce(false);
      expect(utils.readIdpList()).toEqual([]);
    });
  });

  describe('splitDateTime', () => {
    it('splits a Date into separate UTC date and time string components', () => {
      const fullDateTime = new Date('2025-03-10T14:30:45.123Z');

      const { date, time } = utils.splitDateTime(fullDateTime);

      expect(date).toBe('2025-03-10');
      expect(time).toBe('14:30:45.123Z');
    });

    it('handles midnight correctly (time-only becomes 00:00:00)', () => {
      const onlyDate = new Date('2025-03-10T00:00:00.000Z');

      const { date, time } = utils.splitDateTime(onlyDate);

      expect(date).toBe('2025-03-10');
      expect(time).toBe(null);
    });
  });

  describe('toTitleCase', () => {
    it('title-cases first letter, rest lower', () => {
      expect(utils.toTitleCase('hELLO')).toBe('Hello');
    });
    it('returns input when falsy', () => {
      expect(utils.toTitleCase('')).toBe('');
    });
  });

  describe('uuidToActivityId', () => {
    it('returns first 8 chars uppercased', () => {
      expect(utils.uuidToActivityId('a1b2c3d4-e5f6-7890-aaaa-bbbbccccdddd')).toBe('A1B2C3D4');
    });
  });

  describe('uuidValidateV4', () => {
    it('returns true when validate is true and version is 4', () => {
      (validate as jest.Mock).mockReturnValue(true);
      (version as jest.Mock).mockReturnValue(4);
      expect(utils.uuidValidateV4('anything')).toBe(true);
    });

    it('returns false when not valid', () => {
      (validate as jest.Mock).mockReturnValue(false);
      expect(utils.uuidValidateV4('anything')).toBe(false);
    });

    it('returns false when version not 4', () => {
      (validate as jest.Mock).mockReturnValue(true);
      (version as jest.Mock).mockReturnValue(1);
      expect(utils.uuidValidateV4('anything')).toBe(false);
    });
  });
});
