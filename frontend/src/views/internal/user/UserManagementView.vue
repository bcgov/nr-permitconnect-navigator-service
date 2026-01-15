<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ViewHeader from '@/components/common/ViewHeader.vue';
import { ProgressLoader } from '@/components/layout';
import UserCreateModal from '@/components/user/UserCreateModal.vue';
import UserManageModal from '@/components/user/UserManageModal.vue';
import UserProcessModal from '@/components/user/UserProcessModal.vue';
import UserTable from '@/components/user/UserTable.vue';
import {
  Button,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { accessRequestService, userService, yarsService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { MANAGED_GROUP_NAME_LIST } from '@/utils/constants/application';
import { IdentityProviderKind, AccessRequestStatus, GroupName } from '@/utils/enums/application';
import { findIdpConfig, omit } from '@/utils/utils';

import type { Ref } from 'vue';
import type { AccessRequest, Group, User, UserAccessRequest } from '@/types';
import { isAxiosError } from 'axios';

// Constants
const PENDING_STATUSES = {
  PENDING_APPROVAL: 'Pending Approval',
  PENDING_REVOCATION: 'Pending Revocation'
};

const REQUEST_TYPE = {
  ACCESS: 'access',
  REVOCATION: 'revocation'
};

const REQUEST_ACTION = {
  APPROVE: 'Approve',
  DENY: 'Deny'
};

// Composables
const { t } = useI18n();

// Store
const authzStore = useAuthZStore();

// State
const activeTab: Ref<number> = ref(Number(0)); // Current selected tab
const createUserModalVisible: Ref<boolean> = ref(false); // Create user modal visible
const loading: Ref<boolean> = ref(false); // Generic loading flag
const manageUserModalVisible: Ref<boolean> = ref(false); // Group change modal visible
const selectedUserAccessRequest: Ref<UserAccessRequest | undefined> = ref(undefined); // Selected user to modify
const userProcessModalVisible: Ref<boolean> = ref(false); // Approve/Deny modal visible
const userProcessModalAction: Ref<string> = ref(''); // Approve/Deny modal action
const userProcessRequestType: Ref<string> = ref(''); // Access or Revocation request
const usersAndAccessRequests: Ref<UserAccessRequest[]> = ref([]); // Main table data

const getAccessRequests = computed(() =>
  usersAndAccessRequests.value.filter((uaar) => uaar.accessRequest?.status === AccessRequestStatus.PENDING)
);

const getApprovedUsers = computed(() =>
  usersAndAccessRequests.value.filter((uaar) => {
    return uaar.user.status === AccessRequestStatus.APPROVED;
  })
);

// Actions
const confirm = useConfirm();
const toast = useToast();

function assignUserStatus(request: UserAccessRequest) {
  request.user.status =
    request.accessRequest?.status === AccessRequestStatus.PENDING
      ? request.accessRequest.grant
        ? PENDING_STATUSES.PENDING_APPROVAL
        : PENDING_STATUSES.PENDING_REVOCATION
      : AccessRequestStatus.APPROVED;
  return request;
}

function onAccessRequestAction(userAccessRequest: UserAccessRequest, action: string) {
  selectedUserAccessRequest.value = userAccessRequest;
  userProcessRequestType.value = userAccessRequest.accessRequest?.grant ? REQUEST_TYPE.ACCESS : REQUEST_TYPE.REVOCATION;
  userProcessModalAction.value = action;
  userProcessModalVisible.value = true;
}

async function onProcessUserAccessRequest() {
  try {
    const approvedAccess =
      userProcessModalAction.value === REQUEST_ACTION.APPROVE && selectedUserAccessRequest.value?.accessRequest?.grant;
    const deniedAccess =
      userProcessModalAction.value === REQUEST_ACTION.DENY && selectedUserAccessRequest.value?.accessRequest?.grant;
    const approvedRevocation =
      userProcessModalAction.value === REQUEST_ACTION.APPROVE && !selectedUserAccessRequest.value?.accessRequest?.grant;
    const deniedRevocation =
      userProcessModalAction.value === REQUEST_ACTION.DENY && !selectedUserAccessRequest.value?.accessRequest?.grant;

    const response = await accessRequestService.processUserAccessRequest(
      selectedUserAccessRequest.value?.accessRequest?.accessRequestId as string,
      {
        approve: userProcessModalAction.value === REQUEST_ACTION.APPROVE
      }
    );

    if (response) {
      const idx = usersAndAccessRequests.value.findIndex(
        (x) => x.accessRequest?.accessRequestId === selectedUserAccessRequest.value?.accessRequest?.accessRequestId
      );

      // Change status back to approved
      if (usersAndAccessRequests.value[idx] && (approvedAccess || deniedRevocation)) {
        usersAndAccessRequests.value[idx].accessRequest &&
          (usersAndAccessRequests.value[idx].accessRequest.status = approvedAccess
            ? AccessRequestStatus.APPROVED
            : AccessRequestStatus.REJECTED);
        usersAndAccessRequests.value[idx].user.status = AccessRequestStatus.APPROVED;
      }

      // Drop from table
      if (deniedAccess || approvedRevocation) {
        usersAndAccessRequests.value.splice(idx, 1);
      }
    }

    // TODO: i18n parameterized magic for this string
    toast.success(
      `User's ${userProcessRequestType.value} request has been ${
        approvedAccess || approvedRevocation ? 'approved' : 'denied'
      }`
    );
  } catch (error) {
    toast.error(String(error));
  }
}

function onRevoke(userAccessRequest: UserAccessRequest) {
  const admin = authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER]);

  const message = admin ? t('i.user.userManagementView.revokeAdmin1') : t('i.user.userManagementView.revokeAdmin2');
  const successMessage = admin
    ? t('i.user.userManagementView.userRevoked')
    : t('i.user.userManagementView.revokeRequested');

  confirm.require({
    message: message,
    header: 'Revoke user',
    acceptLabel: t('i.user.userManagementView.confirm'),
    acceptClass: 'p-button-danger',
    rejectLabel: t('i.user.userManagementView.cancel'),
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        const omittedUser = omit(userAccessRequest.user, ['groups', 'status']);
        let response;

        if (admin) {
          // Delete subject group
          response = await yarsService.deleteSubjectGroup(
            userAccessRequest.user.sub,
            userAccessRequest.user.groups[0]!.groupId
          );
        } else {
          // Create user access request
          response = await accessRequestService.createUserAccessRequest({
            user: omittedUser,
            accessRequest: {
              grant: false,
              groupId: userAccessRequest.user.groups[0]!.groupId
            }
          });
        }
        // Remove user from table and/or change status value
        if (response) {
          const idx = usersAndAccessRequests.value.findIndex((x) => x.user?.userId === userAccessRequest.user.userId);

          if (admin) {
            usersAndAccessRequests.value.splice(idx, 1);
          } else {
            usersAndAccessRequests.value[idx]!.accessRequest = response.data;
            usersAndAccessRequests.value[idx]!.user.status = PENDING_STATUSES.PENDING_REVOCATION;
          }

          toast.success(successMessage);
        }
      } catch (error) {
        toast.error(`${t('i.user.userManagementView.revokeError')}: ${error}`);
      }
    }
  });
}

async function onUserGroupChange(group: Group) {
  try {
    const user = selectedUserAccessRequest.value?.user;
    if (user) {
      const omittedUser = omit(user, [
        'bceidBusinessName',
        'groups',
        'status',
        'createdAt',
        'createdBy',
        'updatedAt',
        'updatedBy'
      ]);
      const response = await accessRequestService.createUserAccessRequest({
        user: omittedUser,
        accessRequest: {
          userId: user.userId,
          groupId: group.groupId,
          grant: true,
          update: true
        }
      });

      if (response) {
        const idx = usersAndAccessRequests.value.findIndex((x) => x.user?.userId === user.userId);
        usersAndAccessRequests.value[idx]!.user.groups = [group];

        toast.success(`${t('i.user.userManagementView.updateSuccess')}`);
      }
    }
  } catch (error) {
    if (isAxiosError(error))
      toast.error(`${t('i.user.userManagementView.updateError')}, ${error.response?.data.message}`);
    else if (error instanceof Error) toast.error(`${t('i.user.userManagementView.updateError')}, ${error.message}`);
  } finally {
    manageUserModalVisible.value = false;
  }
}

async function onCreateUserAccessRequest(user: User, group: Group) {
  try {
    loading.value = true;

    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);
    if (!idpCfg) throw new Error(`${t('i.user.userManagementView.errorIdpCfg')}`);

    user.idp = idpCfg.idp;

    const userAccessRequest: UserAccessRequest = {
      user,
      accessRequest: {
        userId: user.userId,
        grant: true,
        status: AccessRequestStatus.PENDING,
        groupId: group.groupId
      }
    };

    const response = (await accessRequestService.createUserAccessRequest(userAccessRequest)).data;

    // Update main data table
    if (response.status !== AccessRequestStatus.APPROVED) {
      (userAccessRequest.accessRequest as AccessRequest).accessRequestId = response.accessRequestId;
      usersAndAccessRequests.value.push(assignUserStatus(userAccessRequest));
    } else {
      userAccessRequest.accessRequest = undefined;
      userAccessRequest.user.status = AccessRequestStatus.APPROVED;
      userAccessRequest.user.userId = response.userId;
      if (!userAccessRequest.user.groups) userAccessRequest.user.groups = [];
      userAccessRequest.user.groups.push(group);
      usersAndAccessRequests.value.push(userAccessRequest);
    }

    toast.success(`${t('i.user.userManagementView.requestSuccess')}`);
  } catch (error) {
    if (isAxiosError(error))
      toast.error(`${t('i.user.userManagementView.requestError')}`, error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error(`${t('i.user.userManagementView.requestError')}`, error.message);
  } finally {
    createUserModalVisible.value = false;
    loading.value = false;
  }
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onBeforeMount(async () => {
  loading.value = true;

  try {
    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);
    if (!idpCfg) throw new Error(`${t('i.user.userManagementView.errorIdpCfg')}`);

    const users: User[] = (
      await userService.searchUsers({
        active: true,
        idp: [idpCfg.idp],
        includeUserGroups: true,
        group: MANAGED_GROUP_NAME_LIST.map((x) => x.id),
        initiative: [useAppStore().getInitiative]
      })
    ).data;
    const accessRequests: AccessRequest[] = (await accessRequestService.getAccessRequests()).data;
    const currentAccessRequests = new Map();

    // Create map of all pending requests
    accessRequests.forEach((request) => {
      const currentRequest = currentAccessRequests.get(request.userId);
      if (
        (!currentRequest || (request.createdAt && request.createdAt > currentRequest.createdAt)) &&
        request.status === AccessRequestStatus.PENDING
      ) {
        currentAccessRequests.set(request.userId, request);
      }
    });

    // Combine user and access request data
    // Filter out users who have no assigned group and no access requests
    usersAndAccessRequests.value = users
      .map((user) => {
        const accessRequest = currentAccessRequests.get(user.userId);
        currentAccessRequests.delete(user.userId);
        return assignUserStatus({ accessRequest, user });
      })
      .filter((x) => x.user.groups.length > 0 || x.accessRequest);

    // Get requesting users and add their access requests
    const newRequestingUsers: User[] = (
      await userService.searchUsers({
        userId: Array.from(currentAccessRequests.keys())
      })
    ).data;

    newRequestingUsers.forEach((user) => {
      const accessRequest = currentAccessRequests.get(user.userId);
      usersAndAccessRequests.value.push(assignUserStatus({ accessRequest, user }));
    });
  } catch (error) {
    if (isAxiosError(error)) toast.error('Failed to request access', error.response?.data?.message ?? error.message);
    else if (error instanceof Error) toast.error('Failed to request access', error.message);
  } finally {
    createUserModalVisible.value = false;
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <ProgressLoader v-if="loading" />

    <ViewHeader :header="t('i.user.userManagementView.header')" />

    <UserCreateModal
      v-if="createUserModalVisible"
      v-model:visible="createUserModalVisible"
      @user-create:request="onCreateUserAccessRequest"
    />
    <UserManageModal
      v-if="manageUserModalVisible"
      v-model:visible="manageUserModalVisible"
      @user-manage:save="onUserGroupChange"
    />
    <UserProcessModal
      v-if="userProcessModalVisible"
      v-model:visible="userProcessModalVisible"
      :action="userProcessModalAction"
      :request-type="userProcessRequestType"
      @user-action:process="() => onProcessUserAccessRequest()"
    />
    <Tabs
      v-if="authzStore.isInGroup([GroupName.ADMIN])"
      :value="activeTab"
    >
      <TabList>
        <Tab :value="0">{{ t('i.user.userManagementView.tab0') }}</Tab>
        <Tab :value="1">{{ t('i.user.userManagementView.tab1') }}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel :value="0">
          <div class="flex justify-between">
            <Button
              :label="t('i.user.userManagementView.createUser')"
              type="submit"
              icon="pi pi-plus"
              @click="createUserModalVisible = true"
            />
            <IconField icon-position="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                :placeholder="t('i.user.userManagementView.searchPlaceholder')"
                class="search-input"
              />
            </IconField>
          </div>
          <UserTable
            :filters="filters"
            :users-and-access-requests="getApprovedUsers"
            class="mt-6"
            @user-table:manage="
              (userAccessRequest: UserAccessRequest) => {
                selectedUserAccessRequest = userAccessRequest;
                manageUserModalVisible = true;
              }
            "
            @user-table:revoke="onRevoke"
          />
        </TabPanel>
        <TabPanel :value="1">
          <div class="flex justify-end">
            <IconField icon-position="left">
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                :placeholder="t('i.user.userManagementView.searchPlaceholder')"
                class="search-input"
              />
            </IconField>
          </div>
          <UserTable
            :filters="filters"
            :users-and-access-requests="getAccessRequests"
            class="mt-6"
            :request-table="true"
            @user-table:approve-request="
              (userAccessRequest: UserAccessRequest) => onAccessRequestAction(userAccessRequest, REQUEST_ACTION.APPROVE)
            "
            @user-table:deny-request="
              (userAccessRequest: UserAccessRequest) => onAccessRequestAction(userAccessRequest, REQUEST_ACTION.DENY)
            "
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
    <div v-else>
      <div class="flex justify-between">
        <Button
          :label="t('i.user.userManagementView.createUser')"
          type="submit"
          icon="pi pi-plus"
          @click="createUserModalVisible = true"
        />
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            :placeholder="t('i.user.userManagementView.searchPlaceholder')"
            class="search-input"
          />
        </IconField>
      </div>
      <UserTable
        :filters="filters"
        :users-and-access-requests="usersAndAccessRequests"
        class="mt-6"
        @user-table:manage="
          (userAccessRequest: UserAccessRequest) => {
            selectedUserAccessRequest = userAccessRequest;
            manageUserModalVisible = true;
          }
        "
        @user-table:revoke="onRevoke"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-input {
  width: 20em;
}
</style>
