import { defineStore } from 'pinia';
import { computed, readonly, ref } from 'vue';

import { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { Permission } from '@/types';

export enum NavigationPermission {
  HOUSING = 'housing',
  HOUSING_CONTACT_MANAGEMENT = 'housing.contactmanagement',
  HOUSING_DROPDOWN = 'housing.dropdown',
  HOUSING_ENQUIRY = 'housing.enquiry',
  HOUSING_ENQUIRY_INTAKE = 'housing.enquiry.intake',
  HOUSING_SUBMISSION = 'housing.submission',
  HOUSING_SUBMISSION_INTAKE = 'housing.submission.intake',
  HOUSING_SUBMISSIONS = 'housing.submissions',
  HOUSING_SUBMISSIONS_SUB = 'housing.submissions.sub',
  HOUSING_STATUS_TRACKER = 'housing.statustracker',
  HOUSING_USER_GUIDE = 'housing.userguide',
  HOUSING_USER_MANAGEMENT = 'housing.usermanagement',
  HOUSING_USER_MANAGEMENT_ADMIN = 'housing.usermanagementadmin',
  DEVELOPER = 'developer'
}

const NavigationAuthorizationMap = [
  {
    group: GroupName.ADMIN,
    permissions: [
      NavigationPermission.HOUSING_DROPDOWN,
      NavigationPermission.HOUSING_ENQUIRY,
      NavigationPermission.HOUSING_STATUS_TRACKER,
      NavigationPermission.HOUSING_SUBMISSION,
      NavigationPermission.HOUSING_SUBMISSIONS,
      NavigationPermission.HOUSING_USER_MANAGEMENT,
      NavigationPermission.HOUSING_USER_MANAGEMENT_ADMIN
    ]
  },
  {
    group: GroupName.NAVIGATOR,
    permissions: [
      NavigationPermission.HOUSING_DROPDOWN,
      NavigationPermission.HOUSING_ENQUIRY,
      NavigationPermission.HOUSING_STATUS_TRACKER,
      NavigationPermission.HOUSING_SUBMISSION,
      NavigationPermission.HOUSING_SUBMISSIONS
    ]
  },
  {
    group: GroupName.NAVIGATOR_READ_ONLY,
    permissions: [
      NavigationPermission.HOUSING_ENQUIRY,
      NavigationPermission.HOUSING_SUBMISSION,
      NavigationPermission.HOUSING_SUBMISSIONS
    ]
  },
  {
    group: GroupName.PROPONENT,
    permissions: [
      NavigationPermission.HOUSING,
      NavigationPermission.HOUSING_CONTACT_MANAGEMENT,
      NavigationPermission.HOUSING_DROPDOWN,
      NavigationPermission.HOUSING_ENQUIRY_INTAKE,
      NavigationPermission.HOUSING_SUBMISSION_INTAKE,
      NavigationPermission.HOUSING_SUBMISSIONS_SUB
    ]
  },
  {
    group: GroupName.SUPERVISOR,
    permissions: [
      NavigationPermission.HOUSING_DROPDOWN,
      NavigationPermission.HOUSING_ENQUIRY,
      NavigationPermission.HOUSING_STATUS_TRACKER,
      NavigationPermission.HOUSING_SUBMISSION,
      NavigationPermission.HOUSING_SUBMISSIONS,
      NavigationPermission.HOUSING_USER_MANAGEMENT
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
