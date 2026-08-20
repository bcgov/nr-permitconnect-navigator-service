import { createPinia, setActivePinia } from 'pinia';

import { useUserSearch } from '@/composables/useUserSearch';
import { userService } from '@/services';
import { useConfigStore } from '@/store/configStore';
import { IdentityProviderKind } from '@/utils/enums/application';

import type { User } from '@/types';

// Mocks

const searchUsersSpy = vi.spyOn(userService, 'searchUsers');

// Fixtures

const azureIdp = { kind: IdentityProviderKind.AZUREIDIR, idp: 'azureidir' };

function setIdpList(idpList: unknown[]) {
  useConfigStore().config = { idpList } as never;
}

beforeEach(() => {
  vi.clearAllMocks();
  setActivePinia(createPinia());
  searchUsersSpy.mockResolvedValue([]);
});

// Tests

describe('useUserSearch', () => {
  describe('loadById', () => {
    it('does nothing when the azureidir identity provider is not configured', async () => {
      setIdpList([]);

      const { loadById } = useUserSearch();
      await loadById('user-1');

      expect(searchUsersSpy).not.toHaveBeenCalled();
    });

    it('wraps a single userId in an array and populates users', async () => {
      setIdpList([azureIdp]);
      searchUsersSpy.mockResolvedValue([{ userId: 'user-1' } as User]);

      const { loadById, users } = useUserSearch();
      await loadById('user-1');

      expect(searchUsersSpy).toHaveBeenCalledWith({ userId: ['user-1'] });
      expect(users.value).toEqual([{ userId: 'user-1' }]);
    });

    it('passes an array of userIds through unchanged', async () => {
      setIdpList([azureIdp]);

      const { loadById } = useUserSearch();
      await loadById(['user-1', 'user-2']);

      expect(searchUsersSpy).toHaveBeenCalledWith({ userId: ['user-1', 'user-2'] });
    });
  });

  describe('search', () => {
    it('does nothing when the azureidir identity provider is not configured', async () => {
      setIdpList([]);

      const { search } = useUserSearch();
      await search('someone@example.com');

      expect(searchUsersSpy).not.toHaveBeenCalled();
    });

    it('searches by email and fullName when the input meets the minimum length', async () => {
      setIdpList([azureIdp]);

      const { search } = useUserSearch();
      await search('jo');

      expect(searchUsersSpy).toHaveBeenCalledWith({ email: 'jo', fullName: 'jo', idp: ['azureidir'] });
    });

    // MIN_SEARCH_INPUT_LENGTH is 2, and a valid email always has at least 2
    // characters -- so an email-shaped input always takes the length-based
    // branch above (email + fullName), never this narrower email-only one.
    it('takes the length-based branch (not the email-only branch) for an email-shaped input', async () => {
      setIdpList([azureIdp]);

      const { search } = useUserSearch();
      await search('a@b.co');

      expect(searchUsersSpy).toHaveBeenCalledWith({ email: 'a@b.co', fullName: 'a@b.co', idp: ['azureidir'] });
    });

    it('clears users when the input is too short and not an email', async () => {
      setIdpList([azureIdp]);

      const { search, users } = useUserSearch();
      users.value = [{ userId: 'stale' } as User];
      await search('a');

      expect(searchUsersSpy).not.toHaveBeenCalled();
      expect(users.value).toEqual([]);
    });
  });
});
