import { storeToRefs } from 'pinia';
import { createRouter, createWebHistory, useRouter } from 'vue-router';

import { AuthService, yarsService } from '@/services';
import { useAppStore, useAuthNStore, useAuthZStore } from '@/store';
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
    component: () => import('@/views/GenericView.vue'),
    beforeEnter: async (to) => {
      // Get user groups if we haven't before any routing
      const authnStore = useAuthNStore();
      const { getIsAuthenticated } = storeToRefs(authnStore);
      const authzStore = useAuthZStore();
      if (getIsAuthenticated.value && !authzStore.getGroups.length) {
        const permissions = await yarsService.getPermissions();
        authzStore.setPermissions(permissions.data);
      }

      // Check access
      if (to.meta.access) {
        if (!authzStore.canNavigate(Array.isArray(to.meta.access) ? to.meta.access : [to.meta.access])) {
          useRouter().replace({ name: RouteName.NOT_FOUND });
          return;
        }
      }
    },
    children: [
      {
        path: '/',
        name: RouteName.HOME,
        component: () => import('@/views/HomeView.vue')
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
            path: 'project',
            meta: {
              access: [NavigationPermission.HOUSING_STATUS_TRACKER]
            },
            children: [
              {
                path: '',
                component: () => import('@/views/housing/project/ProjectListView.vue'),
                meta: {
                  access: [NavigationPermission.HOUSING_STATUS_TRACKER]
                },
                name: RouteName.HOUSING_PROJECTS_LIST
              },
              {
                path: ':submissionId',
                component: () => import('@/views/housing/project/ProjectView.vue'),
                meta: {
                  access: [NavigationPermission.HOUSING_STATUS_TRACKER]
                },
                name: RouteName.HOUSING_PROJECT,
                props: createProps
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
        path: '/user',
        name: RouteName.USER_MANAGEMENT,
        component: () => import('@/views/user/UserManagementView.vue')
      },
      {
        path: '/:pathMatch(.*)*',
        name: RouteName.NOT_FOUND,
        component: () => import('@/views/NotFound.vue')
      }
    ]
  }
];

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

    // Check for reroutes
    if (to.name === RouteName.HOUSING) {
      if (!authzStore.canNavigate(NavigationPermission.HOUSING)) {
        router.replace({ name: RouteName.HOUSING_SUBMISSIONS });
        return;
      }
    }
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
