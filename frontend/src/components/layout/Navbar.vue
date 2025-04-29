<script setup lang="ts">
import { ref, watchEffect } from 'vue';

import { Menubar } from '@/lib/primevue';
import { useAppStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { PCNS_CONTACT } from '@/utils/constants/application';
import { HOUSING_ASSISTANCE } from '@/utils/constants/housing';
import { Initiative, RouteName } from '@/utils/enums/application';

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
const appStore = useAppStore();
const authzStore = useAuthZStore();

// State
const items: Ref<Array<NavItem>> = ref([]);

// Actions
watchEffect(() => {
  if (appStore.getInitiative === Initiative.ELECTRIFICATION) {
    items.value = [
      {
        label: 'Home',
        route: RouteName.HOME,
        public: true
      },
      {
        label: 'Electrification',
        items: [
          {
            label: 'Submit an electrification project to the Navigator Service',
            route: RouteName.EXT_ELECTRIFICATION_INTAKE,
            access: NavigationPermission.EXT_ELECTRIFICATION
          }
        ],
        access: [NavigationPermission.EXT_ELECTRIFICATION]
      },
      {
        label: 'Submissions',
        route: RouteName.INT_ELECTRIFICATION,
        access: NavigationPermission.INT_ELECTRIFICATION
      },
      {
        label: 'Contacts',
        route: RouteName.INT_ELECTRIFICATION_CONTACT,
        access: NavigationPermission.INT_CONTACT
      },
      {
        label: 'User Management',
        route: RouteName.INT_ELECTRIFICATION_USER_MANAGEMENT,
        access: NavigationPermission.INT_USER_MANAGEMENT
      },
      {
        label: 'Developer',
        route: RouteName.DEVELOPER,
        access: NavigationPermission.DEVELOPER
      },
      {
        label: 'Help',
        items: [
          // {
          //   label: 'User Guide',
          //   route: RouteName.EXT_ELECTRIFICATION_GUIDE
          // },
          {
            label: 'Report a problem',
            mailTo: `mailto:${PCNS_CONTACT.email}?subject=${PCNS_CONTACT.subject}`,
            public: true
          },
          {
            label: 'Contact a Navigator',
            mailTo: `mailto:${HOUSING_ASSISTANCE.email}?subject=${HOUSING_ASSISTANCE.subject}`,
            access: [NavigationPermission.EXT_ELECTRIFICATION]
          }
        ],
        public: true
      }
    ];
  } else if (appStore.getInitiative === Initiative.HOUSING) {
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
            label: 'Submit a housing project to the Navigator Service',
            route: RouteName.EXT_HOUSING_INTAKE,
            access: NavigationPermission.EXT_HOUSING
          },
          {
            label: 'Submit general enquiries',
            route: RouteName.EXT_HOUSING_ENQUIRY_INTAKE,
            access: NavigationPermission.EXT_HOUSING
          }
        ],
        access: [NavigationPermission.EXT_HOUSING]
      },
      {
        label: 'Submissions',
        route: RouteName.INT_HOUSING,
        access: NavigationPermission.INT_HOUSING
      },
      {
        label: 'Contacts',
        route: RouteName.INT_HOUSING_CONTACT,
        access: NavigationPermission.INT_CONTACT
      },
      {
        label: 'User Management',
        route: RouteName.INT_HOUSING_USER_MANAGEMENT,
        access: NavigationPermission.INT_USER_MANAGEMENT
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
            label: 'User Guide',
            route: RouteName.EXT_HOUSING_GUIDE
          },
          {
            label: 'Report a problem',
            mailTo: `mailto:${PCNS_CONTACT.email}?subject=${PCNS_CONTACT.subject}`,
            public: true
          },
          {
            label: 'Contact a Navigator',
            mailTo: `mailto:${HOUSING_ASSISTANCE.email}?subject=${HOUSING_ASSISTANCE.subject}`,
            access: [NavigationPermission.EXT_HOUSING]
          }
        ],
        public: true
      }
    ];
  } else {
    items.value = [
      {
        label: 'Home',
        route: RouteName.HOME,
        public: true
      },
      {
        label: 'Developer',
        route: RouteName.DEVELOPER,
        access: NavigationPermission.DEVELOPER
      }
    ];
  }
});
</script>

<template>
  <Menubar
    :model="items"
    class="!pl-12"
    role="navigation"
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
          z
          :href="item.mailTo"
          :target="item.target"
          v-bind="props.action"
        >
          <span :id="item.label as string">
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
          <span class="flex">
            {{ item.label }}
          </span>
          <span
            v-if="hasSubmenu"
            :id="item.label as string"
            class="pi pi-angle-down mt-1 ml-1"
          />
        </a>
      </span>
    </template>
  </Menubar>
</template>

<style lang="scss" scoped>
a:hover {
  text-decoration: none;
}

:deep(.p-menubar-submenu) {
  li:first-child {
    border-top: 2px solid #fcba19;
  }
}

:deep(.p-menubar-submenu) {
  li:first-child {
    border-top: 2px solid #fcba19;
  }
}
</style>
