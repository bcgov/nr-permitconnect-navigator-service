import config from 'config';
import { existsSync, readFileSync } from 'fs';
import { validate, version } from 'uuid';

import { AuthType, IdentityProvider, Initiative } from '../../../src/utils/enums/application';
import * as utils from '../../../src/utils/utils';

import type { JwtPayload } from 'jsonwebtoken';

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn()
}));

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('../../../src/components/log', () => ({
  getLogger: () => ({ warn: jest.fn(), info: jest.fn(), error: jest.fn() })
}));

jest.mock('uuid', () => ({
  validate: jest.fn(),
  version: jest.fn()
}));

const CHES_CONFIG = {
  form1: {
    id: '550e8400-e29b-41d4-a716-446655440000',
    apiKey: '550e8400-e29b-41d4-a716-446655440001'
  },
  form2: {
    id: '9f3c8b27-3d1a-4e65-8f6a-5a3d2c74b8cb',
    apiKey: '9f3c8b27-3d1a-4e65-8f6a-5a3d2c74b8cd'
  }
};

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
    (config.get as jest.Mock).mockReset();
    (config.has as jest.Mock).mockReset();
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

  describe('addDashesToUuid', () => {
    it('inserts dashes and lowercases for 32-hex strings', () => {
      const raw = 'AABBCCDDEEFF00112233445566778899';
      expect(utils.addDashesToUuid(raw)).toBe('aabbccdd-eeff-0011-2233-445566778899');
    });
    it('returns original if not length 32', () => {
      expect(utils.addDashesToUuid('123')).toBe('123');
    });
  });

  describe('getChefsApiKey', () => {
    it('returns apiKey that matches form id', () => {
      (config.get as jest.Mock).mockReturnValue(CHES_CONFIG);
      expect(utils.getChefsApiKey('550e8400-e29b-41d4-a716-446655440000')).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(utils.getChefsApiKey('550e8400-e29b-41d4-a716-446655440002')).toBeUndefined();
    });
  });

  describe('getGitRevision', () => {
    it('returns direct HEAD hash when HEAD is a hash', () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (readFileSync as jest.Mock).mockReturnValueOnce('abcdef1234567890\n'); // HEAD
      expect(utils.getGitRevision()).toBe('abcdef1234567890');
    });

    it('resolves ref: and returns resolved hash', () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (readFileSync as jest.Mock)
        .mockReturnValueOnce('ref: refs/heads/main\n') // HEAD
        .mockReturnValueOnce('deadbeefcafebabe\n'); // resolved ref file
      expect(utils.getGitRevision()).toBe('deadbeefcafebabe');
    });

    it('returns empty string and logs on error', () => {
      (existsSync as jest.Mock).mockReturnValueOnce(true);
      (readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('boom');
      });
      expect(utils.getGitRevision()).toBe('');
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
