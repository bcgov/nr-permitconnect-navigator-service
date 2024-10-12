<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Menubar } from '@/lib/primevue';
import { useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { PCNS_CONTACT } from '@/utils/constants/application';
import { HOUSING_CONTACT } from '@/utils/constants/housing';
import { RouteName } from '@/utils/enums/application';

import type { Ref } from 'vue';

// Types
type NavItem = {
  label: string;
  route?: string;
  public?: boolean;
  access?: NavigationPermission | Array<NavigationPermission>;
  items?: Array<NavItem>;
  mailTo?: string;
};

// Store
const authzStore = useAuthZStore();

// State
const items: Ref<Array<NavItem>> = ref([]);

onMounted(() => {
  items.value = [
    {
      label: 'Home',
      route: RouteName.HOME,
      public: true
    },
    {
      label: 'Housing',
      items: [
        {
          label: 'Start a new project investigation',
          route: RouteName.HOUSING_SUBMISSION_INTAKE,
          access: NavigationPermission.HOUSING_SUBMISSION_INTAKE
        },
        {
          label: 'Submit an enquiry',
          route: RouteName.HOUSING_ENQUIRY_INTAKE,
          access: NavigationPermission.HOUSING_ENQUIRY_INTAKE
        },
        {
          label: 'View my drafts and previous entries',
          route: RouteName.HOUSING_SUBMISSIONS,
          access: NavigationPermission.HOUSING_SUBMISSIONS_SUB
        },
        {
          label: 'Check the status of your applications/permits',
          route: RouteName.HOUSING_PROJECTS_LIST,
          access: NavigationPermission.HOUSING_STATUS_TRACKER
        }
      ],
      access: NavigationPermission.HOUSING_DROPDOWN
    },
    {
      label: 'Submissions',
      route: RouteName.HOUSING_SUBMISSIONS,
      access: NavigationPermission.HOUSING_SUBMISSIONS
    },
    {
      label: 'User Management',
      route: RouteName.USER_MANAGEMENT,
      access: NavigationPermission.HOUSING_USER_MANAGEMENT
    },
    {
      label: 'Developer',
      route: RouteName.DEVELOPER,
      access: NavigationPermission.DEVELOPER
    },
    {
      label: 'Help',
      items: [
        {
          label: 'Contact a Navigator',
          mailTo: `mailto:${HOUSING_CONTACT.email}?subject=${HOUSING_CONTACT.subject}`,
          access: [NavigationPermission.HOUSING_SUBMISSION_INTAKE, NavigationPermission.HOUSING_ENQUIRY_INTAKE]
        },
        {
          label: 'Report a problem',
          mailTo: `mailto:${PCNS_CONTACT.email}?subject=${PCNS_CONTACT.subject}`,
          public: true
        },
        {
          label: 'User Guide',
          route: RouteName.HOUSING_GUIDE,
          access: NavigationPermission.HOUSING_USER_GUIDE
        }
      ],
      public: true
    }
  ];
});
</script>

<template>
  <nav class="navigation-main">
    <Menubar
      :model="items"
      class="pl-6"
    >
      <template #item="{ item, props, hasSubmenu }">
        <span
          v-if="item.public || authzStore.canNavigate(item.access)"
          class="menu-item"
        >
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="{ name: item.route }"
            custom
          >
            <a
              :aria-labelledby="item.label as string"
              :href="href"
              v-bind="props.action"
              @click="navigate"
            >
              <span
                :id="item.label as string"
                class="flex"
              >
                {{ item.label }}
              </span>
            </a>
          </router-link>
          <a
            v-else-if="item.mailTo"
            :aria-labelledby="item.label as string"
            :href="item.mailTo"
            class="mail-link"
          >
            <span
              :id="item.label as string"
              class="flex"
            >
              {{ item.label }}
            </span>
          </a>
          <a
            v-else
            :aria-labelledby="item.label as string"
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="flex">{{ item.label }}</span>
            <span
              v-if="hasSubmenu"
              :id="item.label as string"
              class="pi pi-angle-down mt-1 ml-1"
            />
          </a>
        </span>
      </template>
    </Menubar>
  </nav>
</template>

<style lang="scss" scoped>
:deep(.p-menubar-item-link) {
  padding: 0.5rem 0.4rem 0.7rem;
}
</style>
