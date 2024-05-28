<script setup lang="ts">
import { ref, toRaw } from 'vue';
import { useRouter } from 'vue-router';

import { Button, Dropdown } from '@/lib/primevue';
import { AccessRoles } from '@/utils/constants';
import { RouteNames } from '@/utils/constants';
import { useAuthStore } from '@/store';

import type { Ref } from 'vue';
import { storeToRefs } from 'pinia';

const { getRoleOverride } = storeToRefs(useAuthStore());

const router = useRouter();
const role: Ref<string | undefined> = ref(getRoleOverride);
const dropdownValue: Ref<string | undefined> = ref(toRaw(role.value));
</script>

<template>
  <div
    v-if="role"
    class="px-2 py-1 flex align-items-center role-override"
  >
    <p class="m-0 mr-2">Viewing site as:</p>
    <div class="w-2 mr-2">
      <Dropdown
        v-model="dropdownValue"
        class="w-full"
        :options="[...AccessRoles, 'NONE']"
        @change="
          (e) => {
            useAuthStore().setRoleOverride(e.value);
            router.push({ name: RouteNames.HOME });
          }
        "
      />
    </div>
    <div>
      <Button
        secondary
        @click="
          (e) => {
            useAuthStore().setRoleOverride(undefined);
            router.push({ name: RouteNames.HOME });
          }
        "
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
