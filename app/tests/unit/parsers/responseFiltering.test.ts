import { getScopeUserId } from '#src/parsers/responseFiltering';
import { Problem } from '#src/utils/index';

import type { LocalContext } from '#types';

describe('getScopeUserId', () => {
  const selfAuth = { attributes: ['scope:self'] } as LocalContext['currentAuthorization'];
  const allAuth = { attributes: ['scope:all'] } as LocalContext['currentAuthorization'];
  const context = { userId: 'user-1' } as LocalContext['currentContext'];

  it('returns undefined when not scope:self', () => {
    expect(getScopeUserId(allAuth, context)).toBeUndefined();
  });

  it('returns the user ID when scope:self', () => {
    expect(getScopeUserId(selfAuth, context)).toBe('user-1');
  });

  it('throws rather than returning an unscoped result when scope:self has no user ID', () => {
    expect(() => getScopeUserId(selfAuth, {} as LocalContext['currentContext'])).toThrow(Problem);
  });
});
