import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';

import useAppStore from './appStore';
import { yarsService } from '@/services';
import { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Group, Permission } from '@/types';

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
  EXT_GENERAL = 'ext_general',
  EXT_HOUSING = 'ext_housing',

  /*
   * Internal navigation permissions
   */
  INT_CONTACT = 'int_contact',
  INT_ELECTRIFICATION = 'int_electrification',
  INT_GENERAL = 'int_general',
  INT_HOUSING = 'int_housing',
  INT_USER_MANAGEMENT = 'int_user_management'
}

interface NavigationAuthorizationMapT {
  initiative: Initiative;
  group: GroupName;
  permissions: NavigationPermission[];
}

const GlobalNavigations = [NavigationPermission.GLO_USER];

const NavigationAuthorizationMap: NavigationAuthorizationMapT[] = [
  // Electrification
  {
    initiative: Initiative.ELECTRIFICATION,
    group: GroupName.ADMIN,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  },
  {
    initiative: Initiative.ELECTRIFICATION,
    group: GroupName.NAVIGATOR,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_ELECTRIFICATION]
  },
  {
    initiative: Initiative.ELECTRIFICATION,
    group: GroupName.NAVIGATOR_READ_ONLY,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_ELECTRIFICATION]
  },
  {
    initiative: Initiative.ELECTRIFICATION,
    group: GroupName.PROPONENT,
    permissions: [NavigationPermission.EXT_ELECTRIFICATION]
  },
  {
    initiative: Initiative.ELECTRIFICATION,
    group: GroupName.SUPERVISOR,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_ELECTRIFICATION,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  },

  // General
  {
    initiative: Initiative.GENERAL,
    group: GroupName.ADMIN,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_GENERAL,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  },
  {
    initiative: Initiative.GENERAL,
    group: GroupName.NAVIGATOR,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_GENERAL]
  },
  {
    initiative: Initiative.GENERAL,
    group: GroupName.NAVIGATOR_READ_ONLY,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_GENERAL]
  },
  // TODO: Temp disable general for proponents
  // {
  //   initiative: Initiative.GENERAL,
  //   group: GroupName.PROPONENT,
  //   permissions: [NavigationPermission.EXT_GENERAL]
  // },
  {
    initiative: Initiative.GENERAL,
    group: GroupName.SUPERVISOR,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_GENERAL,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  },

  // Housing
  {
    initiative: Initiative.HOUSING,
    group: GroupName.ADMIN,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_HOUSING,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  },
  {
    initiative: Initiative.HOUSING,
    group: GroupName.NAVIGATOR,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_HOUSING]
  },
  {
    initiative: Initiative.HOUSING,
    group: GroupName.NAVIGATOR_READ_ONLY,
    permissions: [NavigationPermission.INT_CONTACT, NavigationPermission.INT_HOUSING]
  },
  {
    initiative: Initiative.HOUSING,
    group: GroupName.PROPONENT,
    permissions: [NavigationPermission.EXT_ELECTRIFICATION, NavigationPermission.EXT_HOUSING]
  },
  {
    initiative: Initiative.HOUSING,
    group: GroupName.SUPERVISOR,
    permissions: [
      NavigationPermission.INT_CONTACT,
      NavigationPermission.INT_HOUSING,
      NavigationPermission.INT_USER_MANAGEMENT
    ]
  }
];

// Add global permissions to all
NavigationAuthorizationMap.forEach((auth) => auth.permissions.push(...GlobalNavigations));

export interface AuthZStoreState {
  groups: Ref<Group[]>;
  permissions: Ref<Permission[]>;
  groupOverride: Ref<GroupName | undefined>;
  initiativeOverride: Ref<Initiative | undefined>;
  groupsImpersonation: Ref<Group[] | undefined>;
  permissionsImpersonation: Ref<Permission[] | undefined>;
}

export const useAuthZStore = defineStore('authz', () => {
  // State
  const state: AuthZStoreState = {
    groups: ref([]),
    permissions: ref([]),
    groupOverride: ref(undefined),
    initiativeOverride: ref(undefined),
    groupsImpersonation: ref(undefined),
    permissionsImpersonation: ref(undefined)
  };

  // Getters
  const getters = {
    can: computed(
      () =>
        (initiative: Initiative, resource: Resource | undefined = undefined, action: Action, group?: GroupName) => {
          const permissions = state.permissionsImpersonation.value ?? state.permissions.value;

          return (
            permissions.some(
              (x) =>
                initiative === x.initiative &&
                x.resource === resource &&
                x.action === action &&
                (group ? x.group === group : true)
            ) ||
            (!getters.isImpersonating.value && getters.isInGroup.value([GroupName.DEVELOPER]))
          );
        }
    ),
    canNavigate: computed(() => (navPerm: NavigationPermission | NavigationPermission[], allowGroupOverride = true) => {
      const currentInitiative = useAppStore().getInitiative;
      const bypassInitiative = currentInitiative === Initiative.PCNS;

      const groups =
        allowGroupOverride && state.groupsImpersonation.value ? state.groupsImpersonation.value : state.groups.value;
      const requiredPerms = Array.isArray(navPerm) ? navPerm : [navPerm];
      const perms = NavigationAuthorizationMap.filter((p) =>
        groups?.some((g) => g.initiativeCode === p.initiative && g.name === p.group)
      )
        .filter((p) => bypassInitiative || p.initiative === currentInitiative)
        .flatMap((p) => p.permissions);
      return (
        !!perms.some((p) => requiredPerms?.includes(p)) ||
        (!getters.isImpersonating.value && getters.isInGroup.value([GroupName.DEVELOPER]))
      );
    }),
    getGroups: computed(() => state.groups.value),
    getGroupOverride: computed(() => state.groupOverride.value),
    getInitiativeOverride: computed(() => state.initiativeOverride.value),
    isInGroup: computed(
      () => (group: GroupName[]) =>
        state.groups.value.some((g) => g.name === GroupName.DEVELOPER) ||
        state.groups.value.some((x) =>
          group.some((g) => x.initiativeCode === useAppStore().getInitiative && g === x.name)
        )
    ),
    isImpersonating: computed(() => !!(state.groupsImpersonation.value && state.permissionsImpersonation.value))
  };

  // Actions
  function setAuthorizationContext(data: { groups: Group[]; permissions: Permission[] }) {
    state.groups.value = data.groups;
    state.permissions.value = data.permissions;
  }

  function setGroupOverride(group: GroupName | undefined) {
    state.groupOverride.value = group;
  }

  function setInitiativeOverride(code: Initiative | undefined) {
    state.initiativeOverride.value = code;
  }

  watch(
    () => [state.groupOverride.value, state.initiativeOverride.value] as const,
    async ([group, initiative], _prev, onInvalidate) => {
      if (!group || !initiative) {
        state.groupsImpersonation.value = undefined;
        state.permissionsImpersonation.value = undefined;
        return;
      }

      let cancelled = false;
      onInvalidate(() => {
        cancelled = true;
      });

      try {
        const response = await yarsService.listPermissions({
          initiative: initiative,
          groupName: group
        });

        if (cancelled) return;

        state.groupsImpersonation.value = response.groups;
        state.permissionsImpersonation.value = response.permissions;
      } catch {
        if (cancelled) return;

        state.groupsImpersonation.value = undefined;
        state.permissionsImpersonation.value = undefined;
      }
    }
  );

  return {
    // State
    ...state,

    // Getters
    ...getters,

    // Actions
    setAuthorizationContext,
    setGroupOverride,
    setInitiativeOverride
  };
});

export default useAuthZStore;
