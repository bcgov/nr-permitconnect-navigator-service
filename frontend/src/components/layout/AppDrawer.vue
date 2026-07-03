<script setup lang="ts">
import StyleClass from 'primevue/styleclass';
import { computed, ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

import contacts from '@/assets/images/contacts.svg';
import developer from '@/assets/images/developer.svg';
import electrificationBold from '@/assets/images/electrification_bold.svg';
import generalBold from '@/assets/images/general_bold.svg';
import help from '@/assets/images/help.svg';
import home from '@/assets/images/home.svg';
import housingBold from '@/assets/images/housing_bold.svg';
import submissions from '@/assets/images/submissions.svg';
import userManagement from '@/assets/images/user_management.svg';
import { Button, Drawer } from '@/lib/primevue';
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
const vStyleclass = StyleClass;
const router = useRouter();

// Store
const appStore = useAppStore();
const authzStore = useAuthZStore();

// State
const items: Ref<DrawerItem[]> = ref([]);

const permittedItems: ComputedRef<DrawerItem[]> = computed(() =>
  items.value
    .filter((item) => item.public || (item.access && authzStore.canNavigate(item.access)))
    .map((item) => ({
      ...item,
      items: item.items?.filter(
        (subItem) => subItem.public || (subItem.access && authzStore.canNavigate(subItem.access))
      )
    }))
);

const visible = ref(false);

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
        icon: electrificationBold,
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
        icon: generalBold,
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
            route: RouteName.EXT_GENERAL_GUIDE,
            access: [NavigationPermission.EXT_GENERAL]
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
        icon: housingBold,
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
            route: RouteName.EXT_HOUSING_GUIDE,
            access: [NavigationPermission.EXT_HOUSING]
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
  <Button
    label="Menu"
    outlined
    class="hover-color"
    @click="visible = true"
  >
    <span class="hidden md:inline">Menu</span>
    <font-awesome-icon icon="fa-solid fa-bars" />
  </Button>
  <Drawer
    v-model:visible="visible"
    position="right"
  >
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-4 pt-4 shrink-0 mb-3">
          <span>
            <Button
              type="button"
              label="Close"
              icon="pi pi-times"
              rectangle
              variant="outlined"
              class="hover-color"
              @click="closeCallback"
            ></Button>
          </span>
        </div>
        <div class="overflow-y-auto">
          <ul class="list-none p-4 m-0 pl-0">
            <li>
              <div class="mb-2">
                <span class="font-bold text-2xl ml-4">Menu</span>
              </div>
              <ul class="list-none p-0 m-0">
                <li
                  v-for="item in permittedItems"
                  :key="item.label"
                  class="overflow-hidden"
                >
                  <router-link
                    v-slot="{ navigate }"
                    :to="{ name: item.route ?? RouteName.HOME }"
                    custom
                  >
                    <Button
                      v-styleclass="{
                        selector: '@next',
                        enterFromClass: 'hidden',
                        enterActiveClass: 'animate-slidedown',
                        leaveToClass: 'hidden',
                        leaveActiveClass: 'animate-slideup'
                      }"
                      text
                      class="no-underline inline-flex items-center mt-2 cursor-pointer hover-color"
                      role="button"
                      tabindex="0"
                      :aria-expanded="item.items ? 'false' : undefined"
                      @click="
                        () => {
                          if (item.route) navigate();
                          if (!item.items) closeCallback();
                        }
                      "
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
                        aria-hidden="true"
                      ></i>
                    </Button>
                  </router-link>

                  <ul
                    v-if="item.items"
                    class="list-none py-0 pl-4 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out"
                  >
                    <li
                      v-for="subItem in item.items"
                      :key="subItem.label"
                      class="my-3"
                    >
                      <Button
                        v-if="subItem.func"
                        class="no-underline cursor-pointer hover-color"
                        role="button"
                        tabindex="0"
                        text
                        @click="
                          () => {
                            if (subItem.func) subItem.func();
                            closeCallback();
                          }
                        "
                      >
                        <span class="font-medium">{{ subItem.label }}</span>
                      </Button>
                      <Button
                        v-else-if="subItem.mailTo"
                        class="no-underline hover-color"
                        :href="subItem.mailTo"
                        text
                        as="a"
                        @click="closeCallback"
                      >
                        <span class="font-medium">{{ subItem.label }}</span>
                      </Button>
                      <router-link
                        v-else
                        v-slot="{ href, navigate }"
                        :to="{ name: subItem.route ?? RouteName.HOME }"
                        custom
                      >
                        <Button
                          class="no-underline hover-color"
                          :href="href"
                          text
                          @click="
                            () => {
                              if (subItem.route) navigate();
                              closeCallback();
                            }
                          "
                        >
                          <span class="font-medium">{{ subItem.label }}</span>
                        </Button>
                      </router-link>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Drawer>
</template>

<style lang="scss" scoped>
.hover-color.p-button:hover {
  background-color: var(--p-content-hover-background);
}
</style>
