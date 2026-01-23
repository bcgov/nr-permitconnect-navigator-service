<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { Button, Menu } from '@/lib/primevue';
import { useAuthNStore } from '@/store';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Types
type MenuType = InstanceType<typeof Menu>;

// Store
const { getIsAuthenticated, getProfile } = storeToRefs(useAuthNStore());

// State
const { t } = useI18n();
const items = ref([
  {
    label: t('common.headerMenu.contactProfile'),
    icon: 'pi pi-user',
    command: () => {
      router.push({ name: RouteName.CONTACT });
    }
  },
  {
    label: t('common.headerMenu.logout'),
    icon: 'pi pi-sign-out',
    command: () => {
      router.push({ name: RouteName.OIDC_LOGOUT });
    }
  }
]);
const menu: Ref<MenuType | undefined> = ref(undefined);

// Actions
const router = useRouter();

const toggle = (event: Event) => {
  menu.value?.toggle(event);
};
</script>

<template>
  <div
    v-if="getIsAuthenticated"
    class="card flex justify-center"
  >
    <Button
      id="menu-toggle"
      type="button"
      text
      class="font-bold text-lg"
      aria-haspopup="true"
      aria-controls="overlay-menu"
      @click="toggle"
    >
      {{ getProfile?.name ?? getProfile?.display_name }}
      <font-awesome-icon
        icon="fa-solid fa-bars"
        class="ml-2 app-primary-color no-click"
      />
    </Button>
    <Menu
      id="overlay-menu"
      ref="menu"
      :model="items"
      :popup="true"
    />
  </div>
</template>
