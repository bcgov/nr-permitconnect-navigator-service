import { storeToRefs } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';

import { default as externalRoutes } from '@/router/external';
import { default as internalRoutes } from '@/router/internal';
import { default as oidcRoutes } from '@/router/oidc';
import { default as contactRoutes } from '@/router/contact';
import { AuthService, contactService, yarsService } from '@/services';
import {
  useAppStore,
  useAuthNStore,
  useAuthZStore,
  useContactStore,
  useEnquiryStore,
  usePermitStore,
  useProjectStore
} from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName, StorageKey, Zone } from '@/utils/enums/application';

import type { LocationQuery, RouteLocationNormalizedGeneric, RouteParamsGeneric, RouteRecordRaw } from 'vue-router';
import type { Contact } from '@/types';

/**
 * Checks for user access to the requested route and redirect if necessary
 * @param to The route to navigate to
 * @returns A Vue route
 */
export function accessHandler(to: RouteLocationNormalizedGeneric) {
  const access = to.meta.access as NavigationPermission[];

  if (access && access.length) {
    const authzStore = useAuthZStore();
    if (!authzStore.canNavigate(access)) {
      return { name: RouteName.NOT_FOUND };
    }
  }
}

/**
 * Obtains user permissions if authenticated before hard navigation
 * @returns A Vue route
 */
export async function bootstrap() {
  const authnStore = useAuthNStore();
  const authzStore = useAuthZStore();
  const contactStore = useContactStore();

  const { getIsAuthenticated } = storeToRefs(authnStore);

  if (getIsAuthenticated.value && !authzStore.getGroups.length) {
    const permissions = await yarsService.getPermissions();
    authzStore.setPermissions(permissions.data);
    const contact: Contact = (await contactService.getCurrentUserContact())?.data;
    contactStore.setContact(contact);
  }
}

/**
 * Parses the route query and params to generate Vue props
 * @param route The route object
 * @returns A Vue props object
 */
export function createProps(route: { query: LocationQuery; params: RouteParamsGeneric }): object {
  return { ...route.query, ...route.params };
}

/**
 * Checks for proper navigation on entry based on role
 * @param to The route to navigate to
 * @returns A Vue route
 */
export function entryRedirect(to: RouteLocationNormalizedGeneric) {
  const authzStore = useAuthZStore();

  if (to.name === RouteName.INT_HOUSING && !authzStore.canNavigate(NavigationPermission.INT_HOUSING)) {
    return { name: RouteName.EXT_HOUSING };
  }
  if (to.name === RouteName.EXT_HOUSING && !authzStore.canNavigate(NavigationPermission.EXT_HOUSING)) {
    return { name: RouteName.INT_HOUSING };
  }
  if (to.name === RouteName.INT_ELECTRIFICATION && !authzStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION)) {
    return { name: RouteName.EXT_ELECTRIFICATION };
  }
  if (to.name === RouteName.EXT_ELECTRIFICATION && !authzStore.canNavigate(NavigationPermission.EXT_ELECTRIFICATION)) {
    return { name: RouteName.INT_ELECTRIFICATION };
  }
}

function convertRemToPixels(rem: number) {
  const pixels = rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  return pixels || 64;
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/GenericView.vue'),
    beforeEnter: [
      bootstrap,
      () => {
        useAppStore().setInitiative(Initiative.PCNS);
        useAppStore().setZone(Zone.GLOBAL);
      },
      entryRedirect,
      accessHandler
    ],
    children: [
      {
        path: '/',
        name: RouteName.HOME,
        component: () => import('@/views/HomeView.vue'),
        beforeEnter: [
          () => {
            useAppStore().setInitiative(Initiative.PCNS);
            useAppStore().setZone(Zone.GLOBAL);
          }
        ],
        meta: { hideBreadcrumb: true, hideNavbar: true }
      },
      {
        path: '/developer',
        name: RouteName.DEVELOPER,
        component: () => import('@/views/DeveloperView.vue'),
        beforeEnter: accessHandler,
        meta: { requiresAuth: true, access: [NavigationPermission.DEVELOPER] }
      },
      {
        path: '/forbidden',
        name: RouteName.FORBIDDEN,
        component: () => import('@/views/ForbiddenView.vue')
      },

      ...externalRoutes,
      ...internalRoutes,
      ...oidcRoutes,
      ...contactRoutes,

      {
        path: '/:pathMatch(.*)*',
        name: RouteName.NOT_FOUND,
        component: () => import('@/views/NotFoundView.vue'),
        meta: { hideBreadcrumb: true }
      }
    ]
  }
];

export default function getRouter() {
  const appStore = useAppStore();
  const authService = new AuthService();

  const router = createRouter({
    history: createWebHistory(),
    routes,
    // TODO: Uncomment when navigating to last location/tab/etc. is fixed
    // scrollBehavior(to, from, savedPosition) {
    scrollBehavior(to, from) {
      // Scroll to hash
      // Slight delay to account for asynchronous loading
      if (to.hash) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              el: to.hash,
              behavior: 'smooth',
              top: convertRemToPixels(5)
            });
          }, 500);
        });
      } else if (to.name === from.name) {
        // Do not scroll if same page
        return false;
      } else {
        // Default scroll to top
        return { top: 0 };
      }
    }
  });

  router.beforeEach(async (to) => {
    appStore.beginDeterminateLoading();

    // If no router params reset specific stores
    if (!('enquiryId' in to.params)) useEnquiryStore().reset();
    if (!('permitId' in to.params)) usePermitStore().reset();
    if (!('projectId' in to.params)) useProjectStore().reset();

    // Backend Redirection Handler
    if (to.query?.r) {
      router.replace({
        path: to.query.r ? to.query.r.toString() : to.path,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        query: (({ r, ...q }) => q)(to.query),
        hash: to.hash
      });
    }

    // Authentication guard
    if (to.meta.requiresAuth) {
      const user = await authService.getUser();
      if (!user || user.expired) {
        window.sessionStorage.setItem(StorageKey.AUTH, `${to.fullPath}`);
        router.push({ name: RouteName.OIDC_LOGIN });
        return;
      }
    }
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
