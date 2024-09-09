<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

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
  TabPanel,
  TabView,
  useConfirm,
  useToast
} from '@/lib/primevue';
import { accessRequestService, userService } from '@/services';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { IdentityProvider, AccessRequestStatus, GroupName } from '@/utils/enums/application';
import { omit } from '@/utils/utils';

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
const activeTab: Ref<number> = ref(Number(0)); // Current selected tab
const createUserModalVisible: Ref<boolean> = ref(false); // Create user modal visible
const loading: Ref<boolean> = ref(false); // Generic loading flag
const manageUserModalVisible: Ref<boolean> = ref(false); // Group change modal visible
const selectedUserAccessRequest: Ref<UserAccessRequest | undefined> = ref(undefined); // Selected user to modify
const userProcessModalVisible: Ref<boolean> = ref(false); // Approve/Deny modal visible
const usersAndAccessRequests: Ref<Array<UserAccessRequest>> = ref([]); // Main table data

const getRevocationRequests = computed(() =>
  usersAndAccessRequests.value.filter(
    (user) => user.accessRequest?.status === AccessRequestStatus.PENDING && user.accessRequest?.grant === false
  )
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

function onDenyRevocation(user: UserAccessRequest) {
  confirm.require({
    message: 'This user’s revocation request will be denied, and they will remain an authorized user.',
    header: 'Deny revocation request',
    acceptLabel: 'Deny',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        console.log('TODO');
        // const response = await accessRequestService.denyAccessRequest(user.accessRequest?.accessRequestId as string);

        // if (response) {
        //   usersAndAccessRequests.value = usersAndAccessRequests.value.filter(
        //     (userAccessRequest) => userAccessRequest.user.userId !== response.data.userId
        //   );
        //   // removing access request from user
        //   delete user.accessRequest;
        //   // assigning current status to user
        //   user = assignUserStatus(user);
        //   usersAccessRequest.value.push(user); // adding user to access request list
        //   toast.success('Revocation request denied');
        //}
      } catch (error) {
        toast.error('Error denying revocation request');
        throw new Error('Error denying revocation request ' + error);
      }
    }
  });
}

async function onProcessUserAccessRequest(approve: boolean) {
  try {
    await accessRequestService.processUserAccessRequest(
      selectedUserAccessRequest.value?.accessRequest?.accessRequestId as string,
      {
        approve
      }
    );

    const idx = usersAndAccessRequests.value.findIndex(
      (x) => x.accessRequest?.accessRequestId === selectedUserAccessRequest.value?.accessRequest?.accessRequestId
    );

    if (approve) {
      usersAndAccessRequests.value[idx].accessRequest = undefined;
      if (!usersAndAccessRequests.value[idx].user.groups) {
        usersAndAccessRequests.value[idx].user.groups = Array<GroupName>();
      }
      usersAndAccessRequests.value[idx].user.groups.push(
        { ...selectedUserAccessRequest.value?.accessRequest }.group as GroupName
      );
      usersAndAccessRequests.value[idx].user.status = AccessRequestStatus.APPROVED;
    } else {
      usersAndAccessRequests.value.splice(idx, 1);
    }

    toast.success(`Access request ${approve ? 'approved' : 'denied'}`);
  } catch (error: any) {
    toast.error(error);
  }
}

function onRevoke(userAccessRequest: UserAccessRequest) {
  const admin = authzStore.isInGroup([GroupName.ADMIN, GroupName.DEVELOPER]);
  let message, successMessage;

  if (admin) {
    message = 'The user will now lose all access to the system.';
    successMessage = 'User revoked';
  } else {
    message = 'The user will be revoked from the system upon the approval of an admin.';
    successMessage = 'Revoke requested';
  }

  confirm.require({
    message: message,
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: async () => {
      try {
        const omittedUser = omit(userAccessRequest.user, ['groups', 'status']);
        const response = await accessRequestService.createUserAccessRequest({
          user: omittedUser,
          accessRequest: {
            grant: false
          }
        });

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
        toast.error('Error revoking user access');
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
  } catch (error) {
    toast.error('Error updating user role ');
  } finally {
    manageUserModalVisible.value = false;
  }
}

async function onCreateUserAccessRequest(user: User, group: GroupName) {
  try {
    loading.value = true;

    user.idp = IdentityProvider.IDIR;

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

onMounted(async () => {
  const users: Array<User> = (
    await userService.searchUsers({
      active: true,
      idp: [IdentityProvider.IDIR],
      includeUserGroups: true
    })
  ).data;

  const accessRequests: Array<AccessRequest> = (await accessRequestService.getAccessRequests()).data;

  // Combine user and access request data
  // Filter out users who have no assigned group and no access requests
  usersAndAccessRequests.value = users
    .map((user) => {
      const accessRequest = accessRequests.find((accessRequest) => accessRequest.userId === user.userId);
      return assignUserStatus({ accessRequest, user });
    })
    .filter((x) => x.user.groups.length > 0 || x.accessRequest);
});
</script>

<template>
  <ProgressLoader v-if="loading" />
  <h3>User Management</h3>
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
    @user-action:process="onProcessUserAccessRequest"
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
        :users-and-access-request="usersAndAccessRequests"
        class="mt-4"
        @user-table:manage="
          (userAccessRequest: UserAccessRequest) => {
            selectedUserAccessRequest = userAccessRequest;
            manageUserModalVisible = true;
          }
        "
        @user-table:process-request="
          (userAccessRequest: UserAccessRequest) => {
            selectedUserAccessRequest = userAccessRequest;
            userProcessModalVisible = true;
          }
        "
        @user-table:revoke="onRevoke"
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
        :users-and-access-request="getRevocationRequests"
        class="mt-4"
        :revocation="true"
        @user-table:revoke="onRevoke"
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
      :users-and-access-request="usersAndAccessRequests"
      class="mt-4"
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
.width {
  width: 20em;
}
</style>
