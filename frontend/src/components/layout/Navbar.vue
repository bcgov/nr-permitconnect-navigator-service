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
              :aria-labelledby="item.label"
              :href="href"
              v-bind="props.action"
              @click="navigate"
            >
              <span
                :id="item.label"
                class="flex"
              >
                {{ item.label }}
              </span>
            </a>
          </router-link>
          <a
            v-else-if="item.mailTo"
            :aria-labelledby="item.label"
            :href="item.mailTo"
            :target="item.target"
            v-bind="props.action"
          >
            <span :id="item.label">
              {{ item.label }}
            </span>
          </a>
          <a
            v-else
            :aria-labelledby="item.label"
            :href="item.url"
            :target="item.target"
            v-bind="props.action"
          >
            <span class="flex">
              {{ item.label }}
            </span>
            <span
              v-if="hasSubmenu"
              :id="item.label"
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
  background-color: $app-primary;
}
// .navigation-main {
//   background-color: #38598a;
//   color: #fcba19;
//   display: flex;
//   width: 100%;
//   box-shadow: 0 6px 8px -4px #b3b1b3;

//   .p-menubar {
//     border: none;
//     padding: 0;
//     background-color: $app-link-text;

//     :deep(.p-menuitem) {
//       &.p-focus {
//         > .p-menuitem-content {
//           background-color: #5a7da9;
//         }
//       }
//     }

//     :deep(.p-menuitem-content) {
//       background-color: #38598a;
//       border-radius: 0;
//       padding: 0;
//     }

//     :deep(.p-submenu-list) {
//       border-radius: 0;
//       padding: 0;
//     }

//     :deep(.p-menuitem-link) {
//       padding: 0.5rem 0.8rem 0.7rem 0.8rem;

//       &:hover {
//         background-color: #5a7da9;
//       }
//     }

//     :deep(.p-menuitem.p-highlight > .p-menuitem-content) {
//       background-color: #5a7da9;
//     }

//     :deep(.p-menuitem .p-focus) {
//       background-color: #38598a;
//       border-radius: 0;
//     }

//     .mail-link {
//       padding: 0.5rem 0.8rem 0.7rem 0.8rem;
//       &:hover {
//         background-color: #5a7da9;
//       }
//     }

//     ul {
//       display: flex;
//       flex-direction: row;
//       margin: 0;
//       color: #ffffff;
//       list-style: none;

//       li {
//         margin-right: 1em;

//         a,
//         p {
//           display: flex;
//           font-weight: normal;
//           min-height: 2rem;
//           color: #ffffff;
//           padding: 0;
//           margin: 0;
//           text-decoration: none;
//         }
//       }
//     }

//     :deep(.p-submenu-list) {
//       background-color: #38598a !important;
//       width: 250px;

//       .p-menuitem:first-child {
//         border-top: 2px solid #fcba19;
//       }
//     }

//     :deep(.pi) {
//       color: #ffffff;
//     }
//   }
// }
</style>
