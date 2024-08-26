<script setup lang="ts">
import { NIL } from 'uuid';
import { onMounted, ref } from 'vue';

import { ProgressLoader } from '@/components/layout';
import UserCreateModal from '@/components/user/UserCreateModal.vue';
import UserManageModal from '@/components/user/UserManageModal.vue';
import UserActionModal from '@/components/user/UserActionModal.vue';
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
import { accessRequestService, userService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { IdentityProvider, AccessRequestStatus, GroupName } from '@/utils/enums/application';

import type { Ref } from 'vue';
import type { AccessRequest, User, UserAccessRequest } from '@/types';

// Constants
const PENDING_STATUSES = {
  PENDING_APPROVAL: 'Pending Approval',
  PENDING_REVOCATION: 'Pending Revocation'
};

// Store
const authzStore = useAuthZStore();

// State
const actionUserAccessRequest: Ref<UserAccessRequest | undefined> = ref(undefined);
const activeTab: Ref<number> = ref(Number(0));
const createUserModalVisible: Ref<boolean> = ref(false);
const getIsLoading: Ref<boolean> = ref(false);
const managedUser: Ref<UserAccessRequest | undefined> = ref(undefined);
const manageUserModalVisible: Ref<boolean> = ref(false);
const userActionModalVisible: Ref<boolean> = ref(false);
const usersAccessRequest: Ref<Array<UserAccessRequest>> = ref([]);
const usersRequest: Ref<Array<UserAccessRequest>> = ref([]);
const usersRevocationRequest: Ref<Array<UserAccessRequest>> = ref([]);

// Actions
const confirm = useConfirm();
const toast = useToast();

function onDelete(user: UserAccessRequest) {
  confirm.require({
    message: 'The user will now lose all access to the system.',
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        let response;
        // TODO: revoke user access by calling role/policy api
        if (user.accessRequest) {
          response = await accessRequestService.deleteAccessRequest(user.accessRequest?.accessRequestId as string);
        }
        if (response) {
          usersRevocationRequest.value = usersRevocationRequest.value.filter(
            (user) => user.userId !== response.data.userId
          );
          toast.success('User access revoked');
        }
      } catch (error) {
        toast.error('Error revoking user access');
        throw new Error('Error revoking user access ' + error);
      }
    }
  });
}

function onDenyRevocation(user: UserAccessRequest) {
  confirm.require({
    message: 'This user’s revocation request will be denied, and they will remain an authorized user.',
    header: 'Deny revocation request',
    acceptLabel: 'Deny',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        const response = await accessRequestService.deleteAccessRequest(user.accessRequest?.accessRequestId as string);

        if (response) {
          usersRevocationRequest.value = usersRevocationRequest.value.filter(
            (user) => user.userId !== response.data.userId
          );
          // removing access request from user
          delete user.accessRequest;
          // assigning current status to user
          user = assignUserStatus(user);
          usersAccessRequest.value.push(user); // adding user to access request list
          toast.success('Revocation request denied');
        }
      } catch (error) {
        toast.error('Error denying revocation request');
        throw new Error('Error denying revocation request ' + error);
      }
    }
  });
}

async function onDenyAccess() {
  try {
    const response = await accessRequestService.deleteAccessRequest(
      actionUserAccessRequest.value?.accessRequest?.accessRequestId as string
    );

    if (response) {
      // filtering out user from access request list
      usersAccessRequest.value = usersAccessRequest.value.filter((user) => user.userId !== response.data.userId);
      toast.success('Access request denied');
    }
  } catch (error) {
    toast.error('Error denying access request');
    throw new Error('Error denying access request ' + error);
  }
}

async function onApproveAccess() {
  try {
    // TODO: approve user access by calling role/policy api to update user role
    const response = await accessRequestService.deleteAccessRequest(
      actionUserAccessRequest.value?.accessRequest?.accessRequestId as string
    );
    if (response) {
      // filtering out user from access request list
      // usersAccessRequest.value = usersAccessRequest.value.filter((user) => user.userId !== response.data.userId);
      delete actionUserAccessRequest.value?.accessRequest;
      actionUserAccessRequest.value = assignUserStatus(actionUserAccessRequest.value as UserAccessRequest);
      toast.success('Access request approved');
    }
  } catch (error) {
    toast.error('Error approving access request');
    throw new Error('Error approving access request ' + error);
  }
}

function onRevoke(user: UserAccessRequest) {
  let message = '';
  let header = '';
  if (!authzStore.canNavigate(NavigationPermission.HOUSING_USER_MANAGEMENT_ADMIN)) {
    message = 'The user will be revoked from the system upon the approval of an admin.';
    header = 'Revoke user';
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
    usersAccessRequest.value.push(assignUserStatus(response.data));
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
  const users: Array<UserAccessRequest> = (
    await userService.searchUsers({
      active: true,
      group: [GroupName.NAVIGATOR]
    })
  ).data.filter((user: UserAccessRequest) => user.userId !== NIL);

  const accessRequests: Array<AccessRequest> = (await accessRequestService.getAccessRequests()).data;

  // Combine user and access request data
  usersRequest.value = users.map((user) => {
    const accessRequest = accessRequests.find((accessRequest) => accessRequest.userId === user.userId);
    user.accessRequest = accessRequest ?? user.accessRequest;
    user = assignUserStatus(user);
    return user;
  });

  // Filter pending revocation request
  usersRevocationRequest.value = usersRequest.value.filter(
    (user) => user.accessRequest?.status === AccessRequestStatus.PENDING && user.accessRequest?.grant === false
  );

  // Filter pending access request
  usersAccessRequest.value = usersRequest.value.filter((user) => user.accessRequest?.grant !== false);
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
  <UserActionModal
    v-if="userActionModalVisible"
    v-model:visible="userActionModalVisible"
    @user-action:approve-access="onApproveAccess"
    @user-action:deny-access="onDenyAccess"
  />
  <TabView
    v-if="authzStore.canNavigate(NavigationPermission.HOUSING_USER_MANAGEMENT_ADMIN)"
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
        :users-request="usersAccessRequest"
        class="mt-4"
        @user-table:manage="
          (user: User) => {
            managedUser = user;
            manageUserModalVisible = true;
          }
        "
        @user-table:action="
          (user: User) => {
            actionUserAccessRequest = user;
            userActionModalVisible = true;
          }
        "
        @user-table:revoke="onRevoke"
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
        :users-request="usersRevocationRequest"
        class="mt-4"
        :revocation="true"
        @user-table:delete="onDelete"
        @user-table:deny-revocation="onDenyRevocation"
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
