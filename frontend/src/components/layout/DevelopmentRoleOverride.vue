<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button, Dropdown } from '@/lib/primevue';
import { PermissionService } from '@/services';
import { AccessRoles } from '@/utils/constants';
import { RouteNames } from '@/utils/constants';

import type { Ref } from 'vue';

const permissionService = new PermissionService();
const router = useRouter();

// State
const role: Ref<string | undefined> = ref(permissionService.getRoleOverride());

// Actions
function clearRole() {
  permissionService.setRoleOverride(undefined);
  role.value = undefined;
  router.push({ name: RouteNames.HOME });
}

function setRole(e: any) {
  permissionService.setRoleOverride(e.value);
  router.push({ name: RouteNames.HOME });
}
</script>

<template>
  <div
    v-if="role"
    class="px-2 py-1 flex align-items-center role-override"
  >
    <p class="m-0 mr-2">Viewing site as:</p>
    <div class="w-2 mr-2">
      <Dropdown
        v-model="role"
        class="w-full"
        :options="AccessRoles"
        @change="(e) => setRole(e)"
      />
    </div>
    <div>
      <Button
        secondary
        @click="clearRole"
      >
        End
      </Button>
    </div>
  </div>
</template>

<style scoped lang="scss">
p {
  color: black;
}

.role-override {
  background-color: #38598a;
}
</style>
