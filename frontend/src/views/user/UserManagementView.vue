<script setup lang="ts">
import {
  Button,
  FilterMatchMode,
  IconField,
  InputIcon,
  InputText,
  TabPanel,
  TabView,
  useConfirm
} from '@/lib/primevue';
import { ref } from 'vue';

import UserCreateModal from '@/components/user/UserCreateModal.vue';
import UserManageModal from '@/components/user/UserManageModal.vue';
import UserTable from '@/components/user/UserTable.vue';
import PermissionService, { Permissions } from '@/services/permissionService';

import type { Ref } from 'vue';
import type { User } from '@/types';

//State
const users: Ref<Array<User>> = ref([]);
const createUserCreateModalVisible: Ref<boolean> = ref(false);
const manageUserCreateModalVisible: Ref<boolean> = ref(false);
const activeTab: Ref<number> = ref(Number(0));

//Actions
const confirm = useConfirm();
const permissionService = new PermissionService();

function onDelete(user: User) {
  // TODO: Implement
  confirm.require({
    message: 'The user will now lose all access to the system.',
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {}
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

function onRevoke(user: User) {
  // TODO: Implement
  confirm.require({
    message: 'The user will be revoked from the system upon the approval of an admin.',
    header: 'Revoke user',
    acceptLabel: 'Confirm',
    acceptClass: 'p-button-danger',
    rejectLabel: 'Cancel',
    accept: () => {}
  });
}

function onManage(user: User) {
  manageUserCreateModalVisible.value = true;
}

function onSave() {
  // TODO: Implement
}

function onUserCreate() {
  // TODO: Implement
}

// Datatable filter(s)
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
</script>
<template>
  <h3>User Management</h3>
  <UserCreateModal
    v-if="createUserCreateModalVisible"
    v-model:visible="createUserCreateModalVisible"
    @user-create:request="onUserCreate"
  />
  <UserManageModal
    v-if="manageUserCreateModalVisible"
    v-model:visible="manageUserCreateModalVisible"
    @user-manage:save="onSave"
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
          @click="createUserCreateModalVisible = true"
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
        :users="users"
        class="mt-4"
        @user-table:manage="onManage"
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
        :users="users"
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
        @click="createUserCreateModalVisible = true"
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
      :users="users"
      class="mt-4"
      @user-table:manage="onManage"
      @user-table:revoke="onRevoke"
    />
  </div>
</template>

<style lang="scss" scoped>
.width {
  width: 20em;
}
</style>
