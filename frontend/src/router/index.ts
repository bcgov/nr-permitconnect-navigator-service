import { createRouter, createWebHistory } from 'vue-router';

import { AuthService } from '@/services';
import { useAppStore, useAuthStore } from '@/store';
import { RouteNames, StorageKey } from '@/utils/constants';

import type { RouteRecordRaw } from 'vue-router';
import { ACCESS_ROLES } from '@/utils/enums';

/**
 * @function createProps
 * Parses the route query and params to generate vue props
 * @param {object} route The route object
 * @returns {object} a Vue props object
 */
function createProps(route: { query: any; params: any }): object {
  return { ...route.query, ...route.params };
}

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: RouteNames.HOME,
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, requiresRole: [ACCESS_ROLES.PCNS_DEVELOPER] }
  },
  {
    path: '/forbidden',
    name: RouteNames.FORBIDDEN,
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: 'Forbidden' }
  },
  {
    path: '/housing',
    component: () => import('@/views/GenericView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: RouteNames.HOUSING,
        component: () => import('../views/housing/HousingView.vue')
      },
      {
        path: 'enquiry',
        name: RouteNames.HOUSING_ENQUIRY,
        component: () => import('../views/housing/ShasEnquiryView.vue'),
        props: createProps
      },
      {
        path: 'intake',
        name: RouteNames.HOUSING_INTAKE,
        component: () => import('@/views/housing/ShasIntakeView.vue'),
        props: createProps
      },
      {
        path: 'submission',
        name: RouteNames.HOUSING_SUBMISSION,
        component: () => import('@/views/housing/SubmissionView.vue'),
        props: createProps,
        meta: {
          requiresRole: [
            ACCESS_ROLES.PCNS_ADMIN,
            ACCESS_ROLES.PCNS_DEVELOPER,
            ACCESS_ROLES.PCNS_NAVIGATOR,
            ACCESS_ROLES.PCNS_SUPERVISOR
          ]
        }
      },
      {
        path: 'submissions',
        name: RouteNames.HOUSING_SUBMISSIONS,
        component: () => import('@/views/housing/SubmissionsView.vue')
      }
    ]
  },
  {
    path: '/oidc',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'callback',
        name: RouteNames.OIDC_CALLBACK,
        component: () => import('@/views/oidc/OidcCallbackView.vue'),
        meta: { title: 'Authenticating...' }
      },
      {
        path: 'login',
        name: RouteNames.OIDC_LOGIN,
        component: () => import('@/views/oidc/OidcLoginView.vue'),
        meta: { title: 'Logging in...' }
      },
      {
        path: 'logout',
        name: RouteNames.OIDC_LOGOUT,
        component: () => import('@/views/oidc/OidcLogoutView.vue'),
        meta: { title: 'Logging out...' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Not Found' }
  }
];

export default function getRouter() {
  const appStore = useAppStore();
  const authService = new AuthService();
  const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to) {
      // Slight delay to account for asynchronous loading
      if (to.hash) {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              el: to.hash,
              behavior: 'smooth'
            });
          }, 500);
        });
      }
    }
  });

  router.beforeEach(async (to) => {
    appStore.beginDeterminateLoading();

    // Backend Redirection Handler
    if (to.query?.r) {
      router.replace({
        path: to.query.r ? to.query.r.toString() : to.path,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
        query: (({ r, ...q }) => q)(to.query)
      });
    }

    // Authentication Guard
    if (to.meta.requiresAuth) {
      const user = await authService.getUser();
      if (!user || user.expired) {
        window.sessionStorage.setItem(StorageKey.AUTH, `${to.fullPath}`);
        router.replace({ name: RouteNames.OIDC_LOGIN });
        return;
      }
    }

    if (to.meta.requiresRole) {
      if (!useAuthStore().userIsRole(to.meta.requiresRole as Array<string>)) {
        router.replace({ name: RouteNames.FORBIDDEN });
        return;
      }
    }

    if (to.name === RouteNames.HOUSING) {
      if (useAuthStore().userHasRole()) {
        router.replace({ name: RouteNames.HOUSING_SUBMISSIONS });
        return;
      }
    }
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
