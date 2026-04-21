import { userService } from '@/services';
import { MIN_SEARCH_INPUT_LENGTH } from '@/utils/constants/application';
import { IdentityProviderKind, Regex } from '@/utils/enums/application';
import { findIdpConfig } from '@/utils/utils';

import type { User } from '@/types';
import { ref, type Ref } from 'vue';

/**
 * Returns a user search based on the given input
 */
export function useUserSearch() {
  const users: Ref<User[]> = ref([]);

  const loadById = async (userId: string | string[]) => {
    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);
    if (!idpCfg) return;

    users.value = (
      await userService.searchUsers({
        userId: Array.isArray(userId) ? userId : [userId]
      })
    ).data;
  };

  const search = async (input: string) => {
    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);

    const EMAILREGEX = new RegExp(Regex.EMAIL);

    if (idpCfg) {
      if (input.length >= MIN_SEARCH_INPUT_LENGTH) {
        users.value = (await userService.searchUsers({ email: input, fullName: input, idp: [idpCfg.idp] })).data;
      } else if (EMAILREGEX.test(input)) {
        users.value = (await userService.searchUsers({ email: input, idp: [idpCfg.idp] })).data;
      } else {
        users.value = [];
      }
    }
  };

  return {
    loadById,
    search,
    users
  };
}
