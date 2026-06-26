<script setup lang="ts">
import { ref } from 'vue';

import { Button, Drawer } from '@/lib/primevue';
// import Ripple from 'primevue/ripple';
import StyleClass from 'primevue/styleclass';
import home from '@/assets/images/home.svg';
import contacts from '@/assets/images/contacts.svg';
import developer from '@/assets/images/developer.svg';
import help from '@/assets/images/help.svg';
import submissions from '@/assets/images/submissions.svg';
import userManagement from '@/assets/images/user_management.svg';
import general from '@/assets/images/G.Land.Button.svg';
import electrification from '@/assets/images/E.Land.Button.svg';
import housing from '@/assets/images/H.Land.Button.svg';
// import { NavigationPermission } from '@/store/authzStore';

// import type { CallbackFn } from '@/types';

// Types
// interface NavItem {
//   label: string;
//   route?: string;
//   func?: CallbackFn;
//   public?: boolean;
//   access?: NavigationPermission | NavigationPermission[];
//   items?: NavItem[];
//   mailTo?: string;
// }

// Composables
// const router = useRouter();

// // Store
// const appStore = useAppStore();
// const authzStore = useAuthZStore();

// // State
// const items: Ref<NavItem[]> = ref([]);

// const permittedItems: ComputedRef<NavItem[]> = computed(() =>
//   items.value.filter((item) => item.public || (item.access && authzStore.canNavigate(item.access)))
// );

// // Actions
// async function createIntake(route: RouteName) {
//   router.push({
//     name: route
//   });
// }

const visible = ref(false);

// Rename imports to match Vue 3 directive naming convention for script setup
// const vRipple = Ripple;
const vStyleclass = StyleClass;
import { computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import { useAppStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { PCNS_CONTACT } from '@/utils/constants/application';
import { HOUSING_ASSISTANCE } from '@/utils/constants/housing';
import { Initiative, RouteName } from '@/utils/enums/application';

import type { ComputedRef, Ref } from 'vue';
import type { CallbackFn } from '@/types';

// Types
interface DrawerItem {
  icon?: string;
  label: string;
  route?: string;
  func?: CallbackFn;
  public?: boolean;
  access?: NavigationPermission | NavigationPermission[];
  items?: DrawerItem[];
  mailTo?: string;
}

// Composables
const router = useRouter();

// Store
const appStore = useAppStore();
const authzStore = useAuthZStore();

// State
const items: Ref<DrawerItem[]> = ref([]);

const permittedItems: ComputedRef<DrawerItem[]> = computed(() =>
  items.value.filter((item) => item.public || (item.access && authzStore.canNavigate(item.access)))
);

// Actions
async function createIntake(route: RouteName) {
  router.push({
    name: route
  });
}

watchEffect(() => {
  if (appStore.getInitiative === Initiative.ELECTRIFICATION) {
    items.value = [
      {
        icon: home,
        label: 'Home',
        route: RouteName.HOME,
        public: true
      },
      {
        icon: electrification,
        label: 'Electrification',
        items: [
          {
            label: 'Submit an electrification project',
            func: () => createIntake(RouteName.EXT_ELECTRIFICATION_INTAKE),
            access: NavigationPermission.EXT_ELECTRIFICATION
          }
        ],
        access: [NavigationPermission.EXT_ELECTRIFICATION]
      },
      {
        icon: submissions,
        label: 'Submissions',
        route: RouteName.INT_ELECTRIFICATION,
        access: NavigationPermission.INT_ELECTRIFICATION
      },
      {
        icon: contacts,
        label: 'Contacts',
        route: RouteName.INT_ELECTRIFICATION_CONTACT,
        access: NavigationPermission.INT_CONTACT
      },
      {
        icon: userManagement,
        label: 'User Management',
        route: RouteName.INT_ELECTRIFICATION_USER_MANAGEMENT,
        access: NavigationPermission.INT_USER_MANAGEMENT
      },
      {
        icon: developer,
        label: 'Developer',
        route: RouteName.DEVELOPER,
        access: NavigationPermission.DEVELOPER
      },
      {
        icon: help,
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
  } else if (appStore.getInitiative === Initiative.GENERAL) {
    items.value = [
      {
        icon: home,
        label: 'Home',
        route: RouteName.HOME,
        public: true
      },
      {
        icon: general,
        label: 'General',
        items: [
          {
            label: 'Submit a general project',
            func: () => createIntake(RouteName.EXT_GENERAL_INTAKE),
            access: NavigationPermission.EXT_GENERAL
          },
          {
            label: 'Submit general enquiries',
            route: RouteName.EXT_GENERAL_ENQUIRY_INTAKE,
            access: NavigationPermission.EXT_GENERAL
          }
        ],
        access: [NavigationPermission.EXT_GENERAL]
      },
      {
        icon: submissions,
        label: 'Submissions',
        route: RouteName.INT_GENERAL,
        access: NavigationPermission.INT_GENERAL
      },
      {
        icon: contacts,
        label: 'Contacts',
        route: RouteName.INT_GENERAL_CONTACT,
        access: NavigationPermission.INT_CONTACT
      },
      {
        icon: userManagement,
        label: 'User Management',
        route: RouteName.INT_GENERAL_USER_MANAGEMENT,
        access: NavigationPermission.INT_USER_MANAGEMENT
      },
      { icon: developer, label: 'Developer', route: RouteName.DEVELOPER, access: NavigationPermission.DEVELOPER },
      {
        icon: help,
        label: 'Help',
        items: [
          {
            label: 'User Guide',
            route: RouteName.EXT_GENERAL_GUIDE
          },
          {
            label: 'Report a problem',
            mailTo: `mailto:${PCNS_CONTACT.email}?subject=${PCNS_CONTACT.subject}`,
            public: true
          },
          {
            label: 'Contact a Navigator',
            mailTo: `mailto:${HOUSING_ASSISTANCE.email}?subject=${HOUSING_ASSISTANCE.subject}`,
            access: [NavigationPermission.EXT_GENERAL]
          }
        ],
        public: true
      }
    ];
  } else if (appStore.getInitiative === Initiative.HOUSING) {
    items.value = [
      { icon: home, label: 'Home', route: RouteName.HOME, public: true },
      {
        icon: housing,
        label: 'Housing',
        items: [
          {
            label: 'Submit a housing project',
            func: () => createIntake(RouteName.EXT_HOUSING_INTAKE),
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
        icon: submissions,
        label: 'Submissions',
        route: RouteName.INT_HOUSING,
        access: NavigationPermission.INT_HOUSING
      },
      {
        icon: contacts,
        label: 'Contacts',
        route: RouteName.INT_HOUSING_CONTACT,
        access: NavigationPermission.INT_CONTACT
      },
      {
        icon: userManagement,
        label: 'User Management',
        route: RouteName.INT_HOUSING_USER_MANAGEMENT,
        access: NavigationPermission.INT_USER_MANAGEMENT
      },
      { icon: developer, label: 'Developer', route: RouteName.DEVELOPER, access: NavigationPermission.DEVELOPER },
      {
        icon: help,
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
      { icon: home, label: 'Home', route: RouteName.HOME, public: true },
      { icon: developer, label: 'Developer', route: RouteName.DEVELOPER, access: NavigationPermission.DEVELOPER }
    ];
  }
});
</script>

<template>
  <!-- {{ permittedItems }} -->
  <!-- <ThemeSwitcher /> -->
  <Button
    label="Menu"
    outlined
    @click="visible = true"
  >
    Menu
    <font-awesome-icon icon="fa-solid fa-bars" />
  </Button>
  <Drawer
    v-model:visible="visible"
    position="right"
  >
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-6 pt-4 shrink-0">
          <span>
            <Button
              type="button"
              @click="closeCallback"
              label="Close menu"
              icon="pi pi-times"
              rectangle
              variant="outlined"
            ></Button>
          </span>
        </div>
        <div class="overflow-y-auto">
          <ul class="list-none p-4 m-0">
            <li>
              <div>
                <span class="font-medium">Menu</span>
              </div>
              <ul
                v-for="item in permittedItems"
                :key="item.label"
                class="list-none p-0 m-0 overflow-hidden"
              >
                <li class="cursor-pointer">
                  <router-link
                    v-slot="{ href, navigate }"
                    :to="{ name: item.route }"
                    custom
                  >
                    <a
                      v-styleclass="{
                        selector: '@next',
                        enterFromClass: 'hidden',
                        enterActiveClass: 'animate-slidedown',
                        leaveToClass: 'hidden',
                        leaveActiveClass: 'animate-slideup'
                      }"
                      class="no-underline inline-flex items-center gap-2 mt-4 mb-2"
                      @click="navigate"
                      :href="href"
                    >
                      <img
                        class="w-7 h-8"
                        :src="item.icon"
                        alt=""
                        aria-hidden="true"
                      />
                      <span class="font-medium">{{ item.label }}</span>
                      <i
                        v-if="item.items"
                        class="pi pi-chevron-down ml-auto"
                      ></i>
                    </a>
                  </router-link>
                  <ul
                    v-for="insideItem in item.items"
                    :key="insideItem.label"
                    class="list-none py-0 pl-4 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  >
                    <li class="my-3 cursor-pointer">
                      <router-link
                        v-slot="{ href, navigate }"
                        :to="{ name: insideItem.route }"
                        custom
                      >
                        <a
                          class="no-underline"
                          :href="href"
                          @click="navigate"
                        >
                          <span class="font-medium">{{ insideItem.label }}</span>
                        </a>
                      </router-link>
                    </li>
                    <!-- <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">Submit general enquiries</span>
                      </a>
                    </li> -->
                  </ul>
                </li>
                <!-- <li class="cursor-pointer">
                  <a class="no-underline inline-flex items-center gap-2 mt-4 mb-2">
                    <img
                      class="w-7 h-8"
                      :src="home"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Home</span>
                  </a>
                </li>
                <li>
                  <a
                    v-styleclass="{
                      selector: '@next',
                      enterFromClass: 'hidden',
                      enterActiveClass: 'animate-slidedown',
                      leaveToClass: 'hidden',
                      leaveActiveClass: 'animate-slideup'
                    }"
                    class="no-underline inline-flex items-center gap-2 my-2 cursor-pointer"
                  >
                    <img
                      class="w-7 h-8"
                      :src="housing"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Housing</span>
                    <i class="pi pi-chevron-down ml-auto"></i>
                  </a>
                  <ul class="list-none py-0 pl-4 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out">
                    <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">Submit a housing project</span>
                      </a>
                    </li>
                    <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">Submit general enquiries</span>
                      </a>
                    </li>
                  </ul>
                </li>
                <li>
                  <a class="no-underline inline-flex items-center gap-2 my-2 cursor-pointer">
                    <img
                      class="w-7 h-8"
                      :src="submissions"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Submissions</span>
                  </a>
                </li>
                <li class="cursor-pointer">
                  <a class="no-underline inline-flex items-center gap-2 my-2">
                    <img
                      class="w-7 h-8"
                      :src="contacts"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Contacts</span>
                  </a>
                </li>
                <li class="cursor-pointer">
                  <a class="no-underline inline-flex items-center gap-2 my-2">
                    <img
                      class="w-7 h-8"
                      :src="userManagement"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">User Management</span>
                  </a>
                </li>
                <li class="cursor-pointer">
                  <a
                    c
                    class="no-underline inline-flex items-center gap-2 my-2"
                  >
                    <img
                      class="w-7 h-8"
                      :src="developer"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Developer</span>
                  </a>
                </li>
                <li>
                  <a
                    v-styleclass="{
                      selector: '@next',
                      enterFromClass: 'hidden',
                      enterActiveClass: 'animate-slidedown',
                      leaveToClass: 'hidden',
                      leaveActiveClass: 'animate-slideup'
                    }"
                    class="no-underline inline-flex items-center gap-2 my-2 cursor-pointer"
                  >
                    <img
                      class="w-7 h-8"
                      :src="help"
                      alt=""
                      aria-hidden="true"
                    />
                    <span class="font-medium">Help</span>
                    <i class="pi pi-chevron-down ml-2"></i>
                  </a>
                  <ul class="list-none py-0 pl-4 hidden transition-all duration-[400ms] ease-in-out">
                    <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">User guide</span>
                      </a>
                    </li>
                    <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">Report a system problem</span>
                      </a>
                    </li>
                    <li class="my-3 cursor-pointer">
                      <a class="no-underline">
                        <span class="font-medium">Contact a navigator</span>
                      </a>
                    </li>
                  </ul>
                </li> -->
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Drawer>
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
</style>
