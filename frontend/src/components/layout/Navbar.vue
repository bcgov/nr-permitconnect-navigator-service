<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Menubar } from '@/lib/primevue';
import { useAuthStore } from '@/store';
import { RouteNames } from '@/utils/constants';
import { ACCESS_ROLES } from '@/utils/enums';

import type { Ref } from 'vue';

// Types
type NavItem = {
  label: string;
  route?: string;
  public?: boolean;
  role?: Array<string>;
  items?: Array<NavItem>;
};

// Store
const authStore = useAuthStore();

// State
const items: Ref<Array<NavItem>> = ref([]);

onMounted(() => {
  items.value = [
    {
      label: 'Home',
      route: RouteNames.HOME,
      public: true
    },
    {
      label: 'Housing',
      items: [
        {
          label: 'Work with a Housing Navigator',
          route: RouteNames.HOUSING_INTAKE
        },
        {
          label: 'Submit an enquiry',
          route: RouteNames.HOUSING_ENQUIRY
        },
        {
          label: 'Drafts and submissions',
          route: RouteNames.HOUSING_SUBMISSIONS
        },
        {
          label: 'Status of application/permit'
        }
      ],
      role: undefined
    },
    {
      label: 'Submissions',
      route: RouteNames.HOUSING_SUBMISSIONS,
      role: [ACCESS_ROLES.PCNS_ADMIN, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
    },
    {
      label: 'User Management',
      role: [ACCESS_ROLES.PCNS_ADMIN, ACCESS_ROLES.PCNS_SUPERVISOR]
    },
    {
      label: 'Developer',
      route: RouteNames.DEVELOPER,
      role: [ACCESS_ROLES.PCNS_DEVELOPER]
    }
  ];
});
</script>

<template>
  <nav class="navigation-main pl-2 lg:pl-6">
    <Menubar :model="items">
      <template #item="{ item, props, hasSubmenu }">
        <span
          v-if="
            item.public ||
            (!item.role && !authStore.userHasRole()) ||
            (item.role && authStore.userIsRole(item.role)) ||
            authStore.userIsRole([ACCESS_ROLES.PCNS_DEVELOPER])
          "
        >
          <router-link
            v-if="item.route"
            v-slot="{ href, navigate }"
            :to="{ name: item.route }"
            custom
          >
            <a
              :href="href"
              v-bind="props.action"
              @click="navigate"
            >
              <span class="flex">{{ item.label }}</span>
            </a>
          </router-link>
          <a
            v-else
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="flex">{{ item.label }}</span>
            <span
              v-if="hasSubmenu"
              class="pi pi-angle-down mt-1 ml-1"
            />
          </a>
        </span>
      </template>
    </Menubar>
  </nav>
</template>

<style lang="scss" scoped>
.navigation-main {
  background-color: #38598a;
  color: #fcba19;
  display: flex;
  width: 100%;
  box-shadow: 0 6px 8px -4px #b3b1b3;
  -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;
  -moz-box-shadow: 0 6px 8px -4px #b3b1b3;

  .p-menubar {
    border: none;
    padding: 0;

    :deep(.p-menuitem-content) {
      background-color: #38598a;
      border-radius: 0;
      padding: 0;
    }

    :deep(.p-submenu-list) {
      border-radius: 0;
      padding: 0;
    }

    :deep(.p-menuitem-link) {
      padding: 0.5rem 0.8rem 0.7rem 0.8rem;

      &:hover {
        background-color: #5a7da9;
      }
    }

    :deep(.p-menuitem.p-highlight > .p-menuitem-content) {
      background-color: #5a7da9;
    }

    :deep(.p-menuitem .p-focus) {
      background-color: #38598a;
      border-radius: 0;
    }

    ul {
      display: flex;
      flex-direction: row;
      margin: 0;
      color: #ffffff;
      list-style: none;

      li {
        margin-right: 1em;

        a,
        p {
          display: flex;
          font-weight: normal;
          min-height: 2rem;
          color: #ffffff;
          padding: 0;
          margin: 0;
          text-decoration: none;
        }
      }
    }

    :deep(.p-submenu-list) {
      background-color: #38598a !important;
      width: 250px;

      .p-menuitem:first-child {
        border-top: 2px solid #fcba19;
      }
    }

    :deep(.pi) {
      color: #ffffff;
    }
  }
}
</style>
