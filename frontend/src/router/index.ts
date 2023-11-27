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
    path: '/initiatives',
    name: RouteNames.INITIATIVES,
    component: () => import('../views/InitiativesView.vue'),
    meta: { title: 'Initiatives' }
  },
  {
    path: '/stylings',
    name: RouteNames.STYLINGS,
    component: () => import('@/views/StylingsView.vue'),
    meta: { requiresAuth: false, title: 'Stylings' }
  },
  {
    path: '/submission',
    name: RouteNames.SUBMISSION,
    component: () => import('@/views/SubmissionView.vue'),
    meta: { requiresAuth: true, title: 'Submission' },
    props: createProps
  },
  {
    path: '/submissions',
    name: RouteNames.SUBMISSIONS,
    component: () => import('@/views/SubmissionsView.vue'),
    meta: { requiresAuth: true, title: 'Submissions' }
  },
  {
    path: '/developer',
    name: RouteNames.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, title: 'Developer' }
  },
  {
    path: '/oidc',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'callback',
        name: RouteNames.CALLBACK,
        component: () => import('@/views/oidc/OidcCallbackView.vue'),
        meta: { title: 'Authenticating...' }
      },
      {
        path: 'login',
        name: RouteNames.LOGIN,
        component: () => import('@/views/oidc/OidcLoginView.vue'),
        meta: { title: 'Logging in...' },
        beforeEnter: () => {
          const entrypoint = `${window.location.pathname}${window.location.search}${window.location.hash}`;
          window.sessionStorage.setItem(StorageKey.AUTH, entrypoint);
        }
      },
      {
        path: 'logout',
        name: RouteNames.LOGOUT,
        component: () => import('@/views/oidc/OidcLogoutView.vue'),
        meta: { title: 'Logging out...' }
      }
    ]
  },
  {
    path: '/forbidden',
    name: RouteNames.FORBIDDEN,
    component: () => import('@/views/Forbidden.vue'),
    meta: { title: 'Forbidden' }
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
    routes
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
        router.replace({ name: RouteNames.LOGIN });
      }
    }
  });

  router.afterEach((to) => {
    // Update document title
    document.title = to.meta.title
      ? `NR Permitting Navigator Service - ${to.meta.title}`
      : 'NR Permitting Navigator Service';

    appStore.endDeterminateLoading();
  });

  return router;
}
