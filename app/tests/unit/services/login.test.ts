import { mockReset } from 'vitest-mock-extended';

import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as userDomain from '../../../src/domains/user.ts';
import * as loginService from '../../../src/services/login.ts';
import { IdentityProviderKind } from '../../../src/utils/enums/application.ts';

import type { JwtPayload } from 'jsonwebtoken';

vi.mock('config');

const createUserSpy = vi.spyOn(userDomain, 'createUser');
const updateUserSpy = vi.spyOn(userDomain, 'updateUser');

describe('login service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('loginService', () => {
    it('updates an existing user and skips contact creation if one exists', async () => {
      const token: JwtPayload = {
        sub: 'existing-sub',
        given_name: 'John',
        family_name: 'Doe',
        email: 'john@example.com',
        identity_provider: IdentityProviderKind.AZUREIDIR
      };

      const mockUser = { userId: 'user-1', sub: 'existing-sub' };

      mockRepos.user.findBySub.mockResolvedValueOnce(mockUser as never);
      updateUserSpy.mockResolvedValueOnce(mockUser as never);
      mockRepos.contact.findMany.mockResolvedValueOnce([{ contactId: 'contact-1' }] as never);

      const result = await loginService.loginService(token);

      expect(mockRepos.user.findBySub).toHaveBeenCalledWith('existing-sub');
      expect(updateUserSpy).toHaveBeenCalledWith(
        expect.anything(),
        'user-1',
        expect.objectContaining({ sub: 'existing-sub', firstName: 'John' })
      );
      expect(createUserSpy).not.toHaveBeenCalled();
      expect(mockRepos.contact.upsert).not.toHaveBeenCalled();
      expect(result).toStrictEqual(mockUser);
    });

    it('creates a new user and creates an initial contact if none exist', async () => {
      const token: JwtPayload = {
        sub: 'new-sub',
        given_name: 'Jane',
        family_name: 'Smith',
        email: 'jane@example.com',
        identity_provider: IdentityProviderKind.AZUREIDIR
      };

      const mockNewUser = { userId: 'user-2', sub: 'new-sub' };

      mockRepos.user.findBySub.mockResolvedValueOnce(null as never);
      createUserSpy.mockResolvedValueOnce(mockNewUser as never);
      mockRepos.contact.findMany.mockResolvedValueOnce([] as never);
      mockRepos.contact.upsert.mockResolvedValueOnce({} as never);

      const result = await loginService.loginService(token);

      expect(createUserSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ sub: 'new-sub', firstName: 'Jane' })
      );
      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ contactId: expect.any(String) }),
        expect.objectContaining({
          userId: 'user-2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com'
        }),
        expect.anything()
      );
      expect(result).toStrictEqual(mockNewUser);
    });

    it('correctly splits BCeID full name into first and last name for contact creation', async () => {
      const token: JwtPayload = {
        sub: 'bceid-sub',
        given_name: 'BCeIDFirst BCeIDLast', // BCeID jams both into given_name
        email: 'bceid@example.com',
        identity_provider: IdentityProviderKind.BCEID
      };

      const mockNewUser = { userId: 'user-3', sub: 'bceid-sub' };

      mockRepos.user.findBySub.mockResolvedValueOnce(null as never);
      createUserSpy.mockResolvedValueOnce(mockNewUser as never);
      mockRepos.contact.findMany.mockResolvedValueOnce([] as never);
      mockRepos.contact.upsert.mockResolvedValueOnce({} as never);

      await loginService.loginService(token);

      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          firstName: 'BCeIDFirst',
          lastName: 'BCeIDLast'
        }),
        expect.anything()
      );
    });

    it('handles BCeID users missing a space in their given name gracefully', async () => {
      const token: JwtPayload = {
        sub: 'bceid-sub-2',
        given_name: 'OneNameOnly',
        email: 'bceid2@example.com',
        identity_provider: IdentityProviderKind.BCEID
      };

      const mockNewUser = { userId: 'user-4', sub: 'bceid-sub-2' };

      mockRepos.user.findBySub.mockResolvedValueOnce(null as never);
      createUserSpy.mockResolvedValueOnce(mockNewUser as never);
      mockRepos.contact.findMany.mockResolvedValueOnce([] as never);
      mockRepos.contact.upsert.mockResolvedValueOnce({} as never);

      await loginService.loginService(token);

      expect(mockRepos.contact.upsert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          firstName: 'OneNameOnly',
          lastName: ' ' // Falls back to default space string
        }),
        expect.anything()
      );
    });
  });
});
