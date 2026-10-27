import { createRouter, createWebHistory } from 'vue-router';

import externalRoutes from '@/router/external';
import internalRoutes from '@/router/internal';
import oidcRoutes from '@/router/oidc';
import contactRoutes from '@/router/contact';
import { AuthService } from '@/services';
import {
  useAppStore,
  useAuthNStore,
  useAuthZStore,
  useCodeStore,
  useConfigStore,
  useEnquiryStore,
  usePermitStore,
  useProjectStore
} from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName, StorageKey, Zone } from '@/utils/enums/application';
import { loadAuthenticatedContext } from '@/utils/bootstrap';

import type { LocationQuery, RouteLocationNormalizedGeneric, RouteParamsGeneric, RouteRecordRaw } from 'vue-router';

/**
 * Checks for user access to the requested route and redirect if necessary
 * @param to The route to navigate to
 * @returns A Vue route
 */
export function accessHandler(to: RouteLocationNormalizedGeneric) {
  const access = to.meta.access as NavigationPermission[];

  if (access?.length) {
    const authzStore = useAuthZStore();
    if (!authzStore.canNavigate(access)) {
      return { name: RouteName.NOT_FOUND };
    }
  }
}

/**
 * Obtains any information that should be loaded only once on hard navigation
 */
async function bootstrap() {
  const appStore = useAppStore();
  const authnStore = useAuthNStore();
  const codeStore = useCodeStore();
  const configStore = useConfigStore();

  appStore.beginDeterminateLoading();

  await configStore.init();
  await authnStore.init();
  await codeStore.init();

  await loadAuthenticatedContext();

  appStore.endDeterminateLoading();
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

  // Without access to either zone, bouncing between them would redirect forever
  const otherZone = (name: RouteName, permission: NavigationPermission) =>
    authzStore.canNavigate(permission) ? { name } : { name: RouteName.NOT_FOUND };

  // Electrification
  if (to.name === RouteName.INT_ELECTRIFICATION && !authzStore.canNavigate(NavigationPermission.INT_ELECTRIFICATION)) {
    return otherZone(RouteName.EXT_ELECTRIFICATION, NavigationPermission.EXT_ELECTRIFICATION);
  }
  if (to.name === RouteName.EXT_ELECTRIFICATION && !authzStore.canNavigate(NavigationPermission.EXT_ELECTRIFICATION)) {
    return otherZone(RouteName.INT_ELECTRIFICATION, NavigationPermission.INT_ELECTRIFICATION);
  }

  // General
  if (to.name === RouteName.INT_GENERAL && !authzStore.canNavigate(NavigationPermission.INT_GENERAL)) {
    return otherZone(RouteName.EXT_GENERAL, NavigationPermission.EXT_GENERAL);
  }
  if (to.name === RouteName.EXT_GENERAL && !authzStore.canNavigate(NavigationPermission.EXT_GENERAL)) {
    return otherZone(RouteName.INT_GENERAL, NavigationPermission.INT_GENERAL);
  }

  // Housing
  if (to.name === RouteName.INT_HOUSING && !authzStore.canNavigate(NavigationPermission.INT_HOUSING)) {
    return otherZone(RouteName.EXT_HOUSING, NavigationPermission.EXT_HOUSING);
  }
  if (to.name === RouteName.EXT_HOUSING && !authzStore.canNavigate(NavigationPermission.EXT_HOUSING)) {
    return otherZone(RouteName.INT_HOUSING, NavigationPermission.INT_HOUSING);
  }
}

function convertRemToPixels(rem: number) {
  const pixels = rem * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  return pixels || 64;
}

// Content loads after navigation, so wait until the scroll target can actually be reached
function waitFor(ready: () => boolean, timeout = 2000): Promise<void> {
  const start = performance.now();
  return new Promise((resolve) => {
    const check = () => (ready() || performance.now() - start > timeout ? resolve() : requestAnimationFrame(check));
    check();
  });
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
        meta: { hideBreadcrumb: true }
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
    // Views with tabs should keep the active tab in the query, or a restored position lands on the wrong layout
    scrollBehavior(to, from, savedPosition) {
      if (savedPosition) {
        const { top } = savedPosition;
        return waitFor(() => document.documentElement.scrollHeight - window.innerHeight >= top).then(
          () => savedPosition
        );
      }
      if (to.hash) {
        return waitFor(() => !!document.getElementById(to.hash.slice(1))).then(() => ({
          el: to.hash,
          behavior: 'smooth' as const,
          top: convertRemToPixels(5)
        }));
      }
      // Staying on the same route keeps the scroll position, e.g. a draft autosave adding its draftId param
      if (to.name === from.name) return false;
      return { top: 0 };
    }
  });

  // Redirects re-run beforeEach and duplicates run only afterEach, so track the navigation instead of pairing hooks
  let navigating = false;

  router.beforeEach(async (to, from) => {
    if (!navigating) {
      navigating = true;
      appStore.beginDeterminateLoading();
    }

    // Authentication guard
    if (to.meta.requiresAuth) {
      const user = await authService.getUser();
      if (!user || user.expired) {
        globalThis.sessionStorage.setItem(StorageKey.AUTH, `${to.fullPath}`);
        router.push({ name: RouteName.OIDC_LOGIN });
        return;
      }
    }

    // Reset stores if navigating to a new route
    // We do not want to reset stores if navigating to the same named route
    // Typically this means param, query, or hash is being silently updated
    if (to.name !== from.name) {
      useEnquiryStore().reset();
      usePermitStore().reset();
      useProjectStore().reset();
    }
  });

  router.afterEach(() => {
    globalThis.sessionStorage.removeItem(StorageKey.CHUNK_RELOAD);
    if (!navigating) return;
    navigating = false;
    appStore.endDeterminateLoading();
  });

  // Errors skip afterEach, so loading has to end here too
  router.onError((error, to) => {
    if (navigating) {
      navigating = false;
      appStore.endDeterminateLoading();
    }

    // A deploy removes the old chunks an open tab still references, so reload once per path to fetch the new ones
    const isChunkError = /dynamically imported module|Importing a module script failed/i.test(error?.message);
    if (isChunkError && globalThis.sessionStorage.getItem(StorageKey.CHUNK_RELOAD) !== to.fullPath) {
      globalThis.sessionStorage.setItem(StorageKey.CHUNK_RELOAD, to.fullPath);
      globalThis.location.assign(to.fullPath);
    }
  });

  return router;
}
