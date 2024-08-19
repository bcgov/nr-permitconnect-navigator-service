import { createRouter, createWebHistory } from 'vue-router';

import { AuthService } from '@/services';
import { useAppStore, useAuthZStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName, StorageKey } from '@/utils/enums/application';

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
    name: RouteName.HOME,
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/soon',
    name: RouteName.COMING_SOON,
    component: () => import('@/views/ComingSoon.vue')
  },
  {
    path: '/developer',
    name: RouteName.DEVELOPER,
    component: () => import('@/views/DeveloperView.vue'),
    meta: { requiresAuth: true, access: NavigationPermission.DEVELOPER }
  },
  {
    path: '/forbidden',
    name: RouteName.FORBIDDEN,
    component: () => import('@/views/Forbidden.vue')
  },
  {
    path: '/housing',
    component: () => import('@/views/GenericView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: RouteName.HOUSING,
        component: () => import('../views/housing/HousingView.vue'),
        meta: {
          access: NavigationPermission.HOUSING
        }
      },
      {
        path: 'enquiry',
        children: [
          {
            path: '',
            name: RouteName.HOUSING_ENQUIRY,
            component: () => import('../views/housing/enquiry/EnquiryView.vue'),
            props: createProps,
            meta: {
              access: NavigationPermission.HOUSING_ENQUIRY
            }
          },
          {
            path: 'intake',
            name: RouteName.HOUSING_ENQUIRY_INTAKE,
            component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
            props: createProps,
            meta: {
              access: NavigationPermission.HOUSING_INTAKE
            }
          }
        ]
      },
      {
        path: 'submission',
        children: [
          {
            path: '',
            name: RouteName.HOUSING_SUBMISSION,
            component: () => import('@/views/housing/submission/SubmissionView.vue'),
            props: createProps,
            meta: {
              access: NavigationPermission.HOUSING_SUBMISSION
            }
          },
          {
            path: 'intake',
            name: RouteName.HOUSING_SUBMISSION_INTAKE,
            component: () => import('@/views/housing/submission/SubmissionIntakeView.vue'),
            props: createProps,
            meta: {
              access: NavigationPermission.HOUSING_INTAKE
            }
          }
        ]
      },
      {
        path: 'submissions',
        name: RouteName.HOUSING_SUBMISSIONS,
        component: () => import('@/views/housing/SubmissionsView.vue'),
        meta: {
          access: [NavigationPermission.HOUSING_SUBMISSIONS, NavigationPermission.HOUSING_SUBMISSIONS_SUB]
        }
      },
      {
        path: '/guide',
        name: RouteName.HOUSING_GUIDE,
        component: () => import('@/views/ComingSoon.vue'),
        meta: { access: NavigationPermission.HOUSING }
      }
    ]
  },
  {
    path: '/oidc',
    component: () => import('@/views/GenericView.vue'),
    children: [
      {
        path: 'callback',
        name: RouteName.OIDC_CALLBACK,
        component: () => import('@/views/oidc/OidcCallbackView.vue'),
        meta: { title: 'Authenticating...' }
      },
      {
        path: 'login',
        name: RouteName.OIDC_LOGIN,
        component: () => import('@/views/oidc/OidcLoginView.vue'),
        meta: { title: 'Logging in...' }
      },
      {
        path: 'logout',
        name: RouteName.OIDC_LOGOUT,
        component: () => import('@/views/oidc/OidcLogoutView.vue'),
        meta: { title: 'Logging out...' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: RouteName.NOT_FOUND,
    component: () => import('@/views/NotFound.vue')
  }
];

function waitForUserGroups(): Promise<string[] | undefined> {
  let attempts = 0;
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  return new Promise(function (resolve, reject) {
    (function _waitForUserGroups() {
      const r = useAuthZStore().getGroups;
      if (r.length > 0) return resolve(r);
      if (attempts > 10) resolve(undefined);
      setTimeout(_waitForUserGroups, 100);
      attempts++;
    })();
  });
}

export default function getRouter() {
  const appStore = useAppStore();
  const authService = new AuthService();
  const authzStore = useAuthZStore();
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

    // Authentication guard
    if (to.meta.requiresAuth) {
      const user = await authService.getUser();
      if (!user || user.expired) {
        window.sessionStorage.setItem(StorageKey.AUTH, `${to.fullPath}`);
        router.replace({ name: RouteName.OIDC_LOGIN });
        return;
      }
    }

    // Race condition on initial load between routing and getting user groups
    // So just hold a sec if we haven't gotten them yet
    await waitForUserGroups();

    // Check for reroutes
    if (to.name === RouteName.HOUSING) {
      if (!authzStore.canNavigate(NavigationPermission.HOUSING)) {
        router.replace({ name: RouteName.HOUSING_SUBMISSIONS });
        return;
      }
    }

    // Check access
    if (to.meta.access) {
      if (!authzStore.canNavigate(Array.isArray(to.meta.access) ? to.meta.access : [to.meta.access])) {
        router.replace({ name: RouteName.NOT_FOUND });
        return;
      }
    }
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
