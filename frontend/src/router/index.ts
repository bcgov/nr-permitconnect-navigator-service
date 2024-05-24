import { createRouter, createWebHistory } from 'vue-router';

import { AuthService } from '@/services';
import { useAppStore } from '@/store';
import { RouteNames, StorageKey } from '@/utils/constants';

import type { RouteRecordRaw } from 'vue-router';

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
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' }
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, title: 'Developer' }
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
        component: () => import('../views/HousingView.vue')
      },
      {
        path: 'enquiry',
        name: RouteNames.HOUSING_ENQUIRY,
        component: () => import('../views/ShasEnquiryView.vue')
      },
      {
        path: 'intake',
        name: RouteNames.HOUSING_INTAKE,
        component: () => import('../views/ShasIntakeView.vue'),
        props: createProps
      },
      {
        path: 'submission',
        name: RouteNames.HOUSING_SUBMISSION,
        component: () => import('@/views/SubmissionView.vue'),
        props: createProps
      },
      {
        path: 'submissions',
        name: RouteNames.HOUSING_SUBMISSIONS,
        component: () => import('@/views/SubmissionsView.vue')
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
      }

      // Forbid if user does not have at least one assigned role
      if (user && (!user?.profile?.client_roles || (user?.profile?.client_roles as []).length === 0)) {
        router.replace({ name: RouteNames.FORBIDDEN });
      }
    }
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
