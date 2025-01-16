import { storeToRefs } from 'pinia';
import { createRouter, createWebHistory, useRouter } from 'vue-router';

import { AuthService, contactService, yarsService } from '@/services';
import { useAppStore, useAuthNStore, useAuthZStore, useContactStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName, StorageKey } from '@/utils/enums/application';

import type { RouteLocationNormalizedGeneric, RouteRecordRaw } from 'vue-router';
import type { Contact } from '@/types';
/**
 * @function accessHandler
 * Checks for user access to the requested route and redirect if necessary
 * @param {object} to The route to navigate to
 * @returns {object} a Vue route
 */
function accessHandler(to: RouteLocationNormalizedGeneric) {
  const access = to.meta.access as NavigationPermission[];

  if (access && access.length) {
    const authzStore = useAuthZStore();
    if (!authzStore.canNavigate(access)) {
      return { name: RouteName.NOT_FOUND };
    }
  }
}

/**
 * @function bootstrap
 * Obtains user permissions if authenticated before hard navigation
 * @returns {object} a Vue route
 */
async function bootstrap() {
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
 * @function createProps
 * Parses the route query and params to generate Vue props
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
    beforeEnter: [bootstrap, accessHandler],
    children: [
      {
        path: '/',
        name: RouteName.HOME,
        component: () => import('@/views/HomeView.vue')
      },
      {
        path: '/contact/profile',
        name: RouteName.CONTACT_PROFILE,
        component: () => import('@/views/contact/ContactProfileView.vue'),
        beforeEnter: accessHandler,
        meta: { requiresAuth: true, access: [NavigationPermission.HOUSING_CONTACT_MANAGEMENT] }
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
        component: () => import('@/views/Forbidden.vue')
      },
      {
        path: '/housing',
        meta: { requiresAuth: true },
        children: [
          {
            path: '',
            name: RouteName.HOUSING,
            component: () => import('../views/housing/HousingView.vue'),
            beforeEnter: () => {
              const authzStore = useAuthZStore();
              if (!authzStore.canNavigate(NavigationPermission.HOUSING)) {
                useRouter().replace({ name: RouteName.HOUSING_SUBMISSIONS });
              }
            },
            meta: {
              access: [NavigationPermission.HOUSING]
            }
          },
          {
            path: 'enquiry',
            children: [
              {
                path: '',
                name: RouteName.HOUSING_ENQUIRY,
                component: () => import('../views/housing/enquiry/EnquiryView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_ENQUIRY]
                }
              },
              {
                path: 'confirmation',
                name: RouteName.HOUSING_ENQUIRY_CONFIRMATION,
                component: () => import('@/views/housing/enquiry/EnquiryConfirmationView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_ENQUIRY_INTAKE]
                }
              },
              {
                path: 'intake',
                name: RouteName.HOUSING_ENQUIRY_INTAKE,
                component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_ENQUIRY_INTAKE]
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
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_SUBMISSION]
                }
              },
              {
                path: 'confirm',
                name: RouteName.HOUSING_SUBMISSION_CONFIRMATION,
                component: () => import('@/views/housing/submission/SubmissionConfirmationView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_SUBMISSION_INTAKE]
                }
              },
              {
                path: 'intake',
                name: RouteName.HOUSING_SUBMISSION_INTAKE,
                component: () => import('@/views/housing/submission/SubmissionIntakeView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  access: [NavigationPermission.HOUSING_SUBMISSION_INTAKE]
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
                beforeEnter: accessHandler,
                meta: {
                  access: [NavigationPermission.HOUSING_STATUS_TRACKER]
                },
                name: RouteName.HOUSING_PROJECTS_LIST
              },
              {
                path: ':submissionId',
                component: () => import('@/views/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                meta: {
                  access: [NavigationPermission.HOUSING_STATUS_TRACKER]
                },
                name: RouteName.HOUSING_PROJECT,
                props: createProps
              },
              {
                path: 'permit/:permitId',
                component: () => import('@/views/permit/PermitStatusView.vue'),
                beforeEnter: accessHandler,
                meta: {
                  access: [NavigationPermission.HOUSING_STATUS_TRACKER]
                },
                name: RouteName.HOUSING_PROJECT_PERMIT,
                props: createProps
              }
            ]
          },
          {
            path: 'submissions',
            name: RouteName.HOUSING_SUBMISSIONS,
            component: () => import('@/views/housing/SubmissionsView.vue'),
            beforeEnter: accessHandler,
            meta: {
              access: [NavigationPermission.HOUSING_SUBMISSIONS, NavigationPermission.HOUSING_SUBMISSIONS_SUB]
            }
          },
          {
            path: '/guide',
            name: RouteName.HOUSING_GUIDE,
            component: () => import('@/views/ComingSoon.vue'),
            meta: { access: [NavigationPermission.HOUSING] }
          }
        ]
      },
      {
        path: '/oidc',
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
        component: () => import('@/views/user/UserManagementView.vue'),
        beforeEnter: accessHandler,
        meta: { requiresAuth: true, access: [NavigationPermission.HOUSING_USER_MANAGEMENT] }
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

      return { top: 0 };
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
  });

  router.afterEach(() => {
    appStore.endDeterminateLoading();
  });

  return router;
}
