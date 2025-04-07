import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Permission } from '@/types';

export enum NavigationPermission {
  /*
   * Developer only navigation permissions
   */
  DEVELOPER = 'developer',

  /*
   * Global navigation permissions
   */
  GLO_USER = 'user',

  /*
   * External navigation permissions
   */
  EXT_ELECTRIFICATION = 'ext_electrification',
  EXT_HOUSING = 'ext_housing',

  /*
   * Internal navigation permissions
   */
  INT_CONTACT = 'int_contact',
  INT_ELECTRIFICATION = 'int_electrification',
  INT_HOUSING = 'int_housing',
  INT_USER_MANAGEMENT = 'int_user_management'
}

const GlobalNavigations = [NavigationPermission.GLO_USER];

const NavigationAuthorizationMap = [
  {
    group: GroupName.ADMIN,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_HOUSING,
      NavigationPermission.INT_USER_MANAGEMENT,
      ...GlobalNavigations
    ]
  },
  {
    group: GroupName.NAVIGATOR,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_HOUSING,
      ...GlobalNavigations
    ]
  },
  {
    group: GroupName.NAVIGATOR_READ_ONLY,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_HOUSING,
      ...GlobalNavigations
    ]
  },
  {
    group: GroupName.PROPONENT,
    permissions: [NavigationPermission.EXT_ELECTRIFICATION, NavigationPermission.EXT_HOUSING, ...GlobalNavigations]
  },
  {
    group: GroupName.SUPERVISOR,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_HOUSING,
      NavigationPermission.INT_USER_MANAGEMENT,
      ...GlobalNavigations
    ]
  }
];

export type AuthZStoreState = {
  groups: Ref<Array<GroupName>>;
  permissions: Ref<Array<Permission>>;
  groupOverride: Ref<GroupName | undefined>;
};

export const useAuthZStore = defineStore('authz', () => {
  // State
  const state: AuthZStoreState = {
    groups: ref([]),
    permissions: ref([]),
    groupOverride: ref(undefined)
  };

  // Getters
  const getters = {
    can: computed(
      () => (initiative: Initiative, resource: Resource, action: Action, group?: GroupName) =>
        state.permissions.value.some(
          (x) =>
            initiative === x.initiative &&
            x.resource === resource &&
            x.action === action &&
            (group ? x.group === group : true)
        ) || getters.isInGroup.value([GroupName.DEVELOPER])
    ),
    canNavigate: computed(
      () =>
        (navPerm: NavigationPermission | Array<NavigationPermission>, allowGroupOverride: boolean = true) => {
          const groups =
            allowGroupOverride && state.groupOverride.value ? state.groupOverride.value : state.groups.value;
          const requiredPerms = Array.isArray(navPerm) ? navPerm : [navPerm];
          const perms = NavigationAuthorizationMap.filter((p) => groups?.includes(p.group)).flatMap(
            (p) => p.permissions
          );
          return groups?.includes(GroupName.DEVELOPER) || !!perms.some((p) => requiredPerms?.includes(p));
        }
    ),
    getGroups: computed(() => state.groups.value),
    getGroupOverride: computed(() => state.groupOverride.value),
    isInGroup: computed(() => (group: Array<GroupName>) => state.groups.value.some((x) => group.includes(x)))
  };

  // Actions
  function setPermissions(data: any) {
    state.groups.value = data.groups;
    state.permissions.value = data.permissions;
  }

  function setGroupOverride(group: GroupName | undefined) {
    state.groupOverride.value = group;
  }

  return {
    // State
    state: readonly(state),

    // Getters
    ...getters,

    // Actions
    setPermissions,
    setGroupOverride
  };
});

export default useAuthZStore;
