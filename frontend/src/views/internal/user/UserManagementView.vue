<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';

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
import { useAuthZStore } from '@/store';
import { MANAGED_GROUP_NAME_LIST } from '@/utils/constants/application';
import { IdentityProviderKind, AccessRequestStatus, GroupName } from '@/utils/enums/application';
import { findIdpConfig, omit } from '@/utils/utils';

import type { Ref } from 'vue';
import type { AccessRequest, User, UserAccessRequest } from '@/types';

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
const usersAndAccessRequests: Ref<Array<UserAccessRequest>> = ref([]); // Main table data

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
      if (approvedAccess || deniedRevocation) {
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

    toast.success(
      `User's ${userProcessRequestType.value} request has been ${
        approvedAccess || approvedRevocation ? 'approved' : 'denied'
      }`
    );
  } catch (error: any) {
    toast.error(error);
  }
}

function onRevoke(userAccessRequest: UserAccessRequest) {
  const admin = authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER]);

  const message = admin
    ? 'The user will now lose all access to the system.'
    : 'The user will be revoked from the system upon the approval of an admin.';
  const successMessage = admin ? 'User revoked' : 'Revoke requested';

  confirm.require({
    message: message,
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    rejectProps: { outlined: true },
    accept: async () => {
      try {
        const omittedUser = omit(userAccessRequest.user, ['groups', 'status']);
        let response;

        if (admin) {
          // Delete subject group
          const body = {
            sub: userAccessRequest.user.sub,
            group: userAccessRequest.user.groups[0]
          };
          response = await yarsService.deleteSubjectGroup(body);
        } else {
          // Create user access request
          response = await accessRequestService.createUserAccessRequest({
            user: omittedUser,
            accessRequest: {
              grant: false,
              group: userAccessRequest.user.groups[0]
            }
          });
        }
        // Remove user from table and/or change status value
        if (response) {
          const idx = usersAndAccessRequests.value.findIndex((x) => x.user?.userId === userAccessRequest.user.userId);

          if (admin) {
            usersAndAccessRequests.value.splice(idx, 1);
          } else {
            usersAndAccessRequests.value[idx].accessRequest = response.data;
            usersAndAccessRequests.value[idx].user.status = PENDING_STATUSES.PENDING_REVOCATION;
          }

          toast.success(successMessage);
        }
      } catch (error) {
        toast.error(`Error revoking user access: ${error}`);
      }
    }
  });
}

async function onUserGroupChange(group: GroupName) {
  try {
    const user = selectedUserAccessRequest.value?.user;
    if (user) {
      const omittedUser = omit(user, ['groups', 'status']);
      const response = await accessRequestService.createUserAccessRequest({
        user: omittedUser,
        accessRequest: {
          userId: user.userId,
          group: group,
          grant: true
        }
      });

      if (response) {
        const idx = usersAndAccessRequests.value.findIndex((x) => x.user?.userId === user.userId);
        usersAndAccessRequests.value[idx].user.groups = [group];

        toast.success('User role updated');
      }
    }
  } catch (error: any) {
    toast.error(`Error updating user role, ${error.response.data.message}`);
  } finally {
    manageUserModalVisible.value = false;
  }
}

async function onCreateUserAccessRequest(user: User, group: GroupName) {
  try {
    loading.value = true;

    const idpCfg = findIdpConfig(IdentityProviderKind.IDIR);
    if (!idpCfg) throw new Error('Failed to obtain IDP config');

    user.idp = idpCfg.idp;

    const userAccessRequest: UserAccessRequest = {
      user,
      accessRequest: {
        userId: user.userId,
        grant: true,
        status: AccessRequestStatus.PENDING,
        group: group
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
      if (!userAccessRequest.user.groups) userAccessRequest.user.groups = Array<GroupName>();
      userAccessRequest.user.groups.push(group);
      usersAndAccessRequests.value.push(userAccessRequest);
    }

    toast.success('Access requested');
  } catch (error: any) {
    toast.error('Failed to request access', error.response?.data?.message ?? error.message);
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
  const users: Array<User> = (
    await userService.searchUsers({
      active: true,
      idp: [IdentityProvider.IDIR],
      includeUserGroups: true,
      group: MANAGED_GROUP_NAME_LIST.map((x) => x.id)
    })
  ).data;
  const accessRequests: Array<AccessRequest> = (await accessRequestService.getAccessRequests()).data;
  const currentAccessRequests = new Map();

    if (!idpCfg) throw new Error('Failed to obtain IDP config');

    const users: Array<User> = (
      await userService.searchUsers({
        active: true,
        idp: [idpCfg.idp],
        includeUserGroups: true,
        group: MANAGED_GROUP_NAME_LIST.map((x) => x.id)
      })
    ).data;
    const accessRequests: Array<AccessRequest> = (await accessRequestService.getAccessRequests()).data;
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

  newRequestingUsers.forEach((user) => {
    const accessRequest = currentAccessRequests.get(user.userId);
    usersAndAccessRequests.value.push(assignUserStatus({ accessRequest, user }));
  });

  loading.value = false;
});
</script>

<template>
  <ProgressLoader v-if="loading" />
  <h1>User Management</h1>
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
    v-model:action="userProcessModalAction"
    v-model:request-type="userProcessRequestType"
    @user-action:process="() => onProcessUserAccessRequest()"
  />
  <Tabs
    v-if="authzStore.isInGroup([GroupName.ADMIN])"
    :value="activeTab"
  >
    <TabList>
      <Tab :value="0">Manage users</Tab>
      <Tab :value="1">User access requests</Tab>
    </TabList>
    <TabPanels>
      <TabPanel :value="0">
        <div class="flex justify-between">
          <Button
            label="Create new user"
            type="submit"
            icon="pi pi-plus"
            @click="createUserModalVisible = true"
          />
          <IconField icon-position="left">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="filters['global'].value"
              placeholder="Search all"
              class="search-input"
            />
          </IconField>
        </div>
        <UserTable
          v-model:filters="filters"
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
              placeholder="Search all"
              class="search-input"
            />
          </IconField>
        </div>
        <UserTable
          v-model:filters="filters"
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
        label="Create new user"
        type="submit"
        icon="pi pi-plus"
        @click="createUserModalVisible = true"
      />
      <IconField icon-position="left">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="filters['global'].value"
          placeholder="Search all"
          class="search-input"
        />
      </IconField>
    </div>
    <UserTable
      v-model:filters="filters"
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
</template>

<style lang="scss" scoped>
.search-input {
  width: 20em;
}
</style>
