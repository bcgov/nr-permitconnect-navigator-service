<script setup lang="ts">
import { NIL } from 'uuid';
import { onMounted, ref } from 'vue';

import { ProgressLoader } from '@/components/layout';
import UserCreateModal from '@/components/user/UserCreateModal.vue';
import UserManageModal from '@/components/user/UserManageModal.vue';
import UserTable from '@/components/user/UserTable.vue';
import {
  Button,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  TabPanel,
  TabView,
  useConfirm,
  useToast
} from '@/lib/primevue';
import PermissionService, { Permissions } from '@/services/permissionService';
import { accessRequestService, userService } from '@/services';
import { IdentityProvider, AccessRequestStatus, AccessRole } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { AccessRequest, User, UserAccessRequest } from '@/types';

//State
const createUserModalVisible: Ref<boolean> = ref(false);
const manageUserModalVisible: Ref<boolean> = ref(false);
const activeTab: Ref<number> = ref(Number(0));
const getIsLoading: Ref<boolean> = ref(false);
const managedUser: Ref<UserAccessRequest | undefined> = ref(undefined);
const usersRequest: Ref<Array<UserAccessRequest>> = ref([]);

// Constants
const PENDING_STATUSES = {
  PENDING_APPROVAL: 'Pending Approval',
  PENDING_REVOCATION: 'Pending Revocation'
};

//Actions
const confirm = useConfirm();
const permissionService = new PermissionService();
const toast = useToast();

function onDelete(user: UserAccessRequest) {
  let message = '';
  let header = '';
  if (user.accessRequest?.status === 'Pending') {
    message = 'The user will now be deleted from the list.';
    header = 'Delete user';
  } else {
    message = 'The user will now lose all access to the system.';
    header = 'Revoke user';
  }
  confirm.require({
    message: message,
    header: header,
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        //TODO : Implement
      } catch (error) {
        throw new Error('Error deleting user access ' + error);
      }
    }
  });
}

function onApprove(user: User) {
  // TODO: Implement
  confirm.require({
    message: 'The user will now be an authorized user.',
    header: 'Approve user',
    acceptLabel: 'Approve',
    acceptClass: 'p-button-accept',
    rejectLabel: 'Cancel',
    accept: () => {}
  });
}

function onRevoke(user: UserAccessRequest) {
  confirm.require({
    message: 'The user will be revoked from the system upon the approval of an admin.',
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        const response = await accessRequestService.revokeUserAccessRequest({
          accessRequest: { userId: user.userId, grant: false }
        });
        if (response) {
          user.accessRequest = response.data;
          user = assignUserStatus(user);
          toast.success('Revoke requested');
        }
      } catch (error) {
        toast.error('Error revoking user access');
        throw new Error('Error revoking user access ' + error);
      }
    }
  });
}

async function onUserManageSave(role: string) {
  if (managedUser.value?.accessRequest) managedUser.value.accessRequest.role = role;
  try {
    // TODO: Implement
    toast.success('User role updated');
  } catch (error) {
    toast.error('Error updating user role ');
  } finally {
    manageUserModalVisible.value = false;
  }
}

async function onUserCreate(user: UserAccessRequest, role: string) {
  let newUser: UserAccessRequest = { ...user }; // using spread operator to avoid reference to the same object
  try {
    getIsLoading.value = true;
    newUser.idp = IdentityProvider.IDIR;
    const accessRequest = {
      userId: user.userId,
      grant: true,
      status: AccessRequestStatus.PENDING,
      role: role
    };
    const response = await accessRequestService.createUserAccessRequest({
      user: newUser,
      accessRequest: accessRequest
    });

    usersRequest.value.push(assignUserStatus(response.data));
    toast.success('Access requested');
  } catch (error: any) {
    toast.error('Failed to request access', error.response?.data?.message ?? error.message);
  } finally {
    createUserModalVisible.value = false;
    getIsLoading.value = false;
  }
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

onMounted(async () => {
  const response = await userService.searchUsers({
    active: true,
    role: AccessRole.PCNS_NAVIGATOR
  });
  let users: Array<UserAccessRequest> = response.data;
  // filtering out system user
  users = users.filter((user) => user.userId !== NIL);
  let accessRequests: Array<AccessRequest> = (await accessRequestService.getAccessRequests()).data;
  // combining user and access request data
  usersRequest.value = users.map((user) => {
    const accessRequest = accessRequests.find((accessRequest) => accessRequest.userId === user.userId);
    user.accessRequest = accessRequest ?? user.accessRequest;
    user = assignUserStatus(user);
    return user;
  });
});

function assignUserStatus(user: UserAccessRequest) {
  user.status =
    user?.accessRequest?.status && user.accessRequest?.status === AccessRequestStatus.PENDING
      ? user.accessRequest.grant
        ? PENDING_STATUSES.PENDING_APPROVAL
        : PENDING_STATUSES.PENDING_REVOCATION
      : AccessRequestStatus.APPROVED;
  return user;
}
</script>

<template>
  <ProgressLoader v-if="getIsLoading" />
  <h3>User Management</h3>
  <UserCreateModal
    v-if="createUserModalVisible"
    v-model:visible="createUserModalVisible"
    @user-create:request="
      (user: User, role: string) => {
        onUserCreate(user, role);
      }
    "
  />
  <UserManageModal
    v-if="manageUserModalVisible"
    v-model:visible="manageUserModalVisible"
    @user-manage:save="onUserManageSave"
  />
  <TabView
    v-if="permissionService.can(Permissions.NAVIGATION_HOUSING_USER_MANAGEMENT_ADMIN)"
    v-model:activeIndex="activeTab"
  >
    <TabPanel header="Manage users">
      <div class="flex justify-content-between">
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
            class="width"
          />
        </IconField>
      </div>
      <UserTable
        v-model:filters="filters"
        :users-request="usersRequest"
        class="mt-4"
        @user-table:manage="
          (user: User) => {
            managedUser = user;
            manageUserModalVisible = true;
          }
        "
        @user-table:approve="onApprove"
        @user-table:delete="onDelete"
      />
    </TabPanel>
    <TabPanel header="Revocation requests">
      <div class="flex justify-content-end">
        <IconField icon-position="left">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="filters['global'].value"
            placeholder="Search all"
            class="width"
          />
        </IconField>
      </div>
      <UserTable
        v-model:filters="filters"
        :users-request="usersRequest"
        class="mt-4"
        :revocation="true"
        @user-table:delete="onDelete"
      />
    </TabPanel>
  </TabView>
  <div v-else>
    <div class="flex justify-content-between">
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
          class="width"
        />
      </IconField>
    </div>
    <UserTable
      v-model:filters="filters"
      :users-request="usersRequest"
      class="mt-4"
      @user-table:manage="
        (user: User) => {
          managedUser = user;
          manageUserModalVisible = true;
        }
      "
      @user-table:revoke="onRevoke"
    />
  </div>
</template>

<style lang="scss" scoped>
.width {
  width: 20em;
}
</style>
