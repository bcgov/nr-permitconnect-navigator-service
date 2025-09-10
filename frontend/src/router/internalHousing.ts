import { accessHandler, createProps, entryRedirect } from '@/router';
import { useAppStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'housing',
    beforeEnter: [entryRedirect, () => useAppStore().setInitiative(Initiative.HOUSING)],
    meta: { access: [NavigationPermission.INT_HOUSING], requiresAuth: true },
    children: [
      {
        path: '',
        meta: { breadcrumb: 'Submissions' },
        children: [
          {
            path: '',
            name: RouteName.INT_HOUSING,
            component: () => import('@/views/internal/housing/HousingView.vue'),
            beforeEnter: accessHandler
          },
          {
            path: 'enquiry/:enquiryId',
            component: () => import('@/views/GenericView.vue'),
            meta: { dynamicBreadcrumb: 'enquiry' },
            children: [
              {
                path: '',
                name: RouteName.INT_HOUSING_ENQUIRY,
                component: () => import('@/views/internal/housing/enquiry/EnquiryView.vue'),
                beforeEnter: accessHandler,
                props: createProps
              },
              {
                path: 'note',
                component: () => import('@/views/GenericView.vue'),
                meta: { dynamicBreadcrumb: 'note' },
                children: [
                  {
                    path: ':noteHistoryId',
                    name: RouteName.INT_HOUSING_ENQUIRY_NOTE,
                    component: () => import('@/views/internal/note/NoteView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  }
                ]
              }
            ]
          },
          {
            path: 'project/:projectId',
            component: () => import('@/views/GenericView.vue'),
            meta: { dynamicBreadcrumb: 'project' },
            children: [
              {
                path: '',
                name: RouteName.INT_HOUSING_PROJECT,
                component: () => import('@/views/internal/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps
              },
              {
                path: 'enquiry',
                component: () => import('@/views/GenericView.vue'),
                children: [
                  {
                    path: ':enquiryId',
                    name: RouteName.INT_HOUSING_PROJECT_ENQUIRY,
                    component: () => import('@/views/internal/housing/enquiry/EnquiryView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: { dynamicBreadcrumb: 'enquiry' }
                  }
                ]
              },
              {
                path: 'authorization',
                component: () => import('@/views/GenericView.vue'),
                meta: { dynamicBreadcrumb: 'authorization' },
                children: [
                  {
                    path: '',
                    name: RouteName.INT_HOUSING_PROJECT_ADD_AUTHORIZATION,
                    component: () => import('@/views/internal/housing/authorization/AuthorizationView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  },
                  {
                    path: ':permitId',
                    name: RouteName.INT_HOUSING_PROJECT_AUTHORIZATION,
                    component: () => import('@/views/internal/housing/authorization/AuthorizationView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  }
                ]
              },
              {
                path: 'note',
                component: () => import('@/views/GenericView.vue'),
                meta: { dynamicBreadcrumb: 'note' },
                children: [
                  {
                    path: ':noteHistoryId?',
                    name: RouteName.INT_HOUSING_PROJECT_NOTE,
                    component: () => import('@/views/internal/note/NoteView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  }
                ]
              },
              {
                path: 'proponent',
                component: () => import('@/views/GenericView.vue'),
                meta: { breadcrumb: 'Proponent view' },
                children: [
                  {
                    path: '',
                    name: RouteName.INT_HOUSING_PROJECT_PROPONENT,
                    // TODO: Consider creating reuse component from view so we can create a separate internal view
                    component: () => import('@/views/external/housing/project/ProjectView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  },
                  {
                    path: ':permitId',
                    name: RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT,
                    // TODO: Consider creating reuse component from view so we can create a separate internal view
                    component: () => import('@/views/external/housing/permit/PermitStatusView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: { dynamicBreadcrumb: 'permit' }
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'contact',
        meta: { breadcrumb: 'Contacts', requiresAuth: true },
        children: [
          {
            path: '',
            name: RouteName.INT_HOUSING_CONTACT,
            component: () => import('@/views/internal/housing/contact/ContactsView.vue'),
            beforeEnter: accessHandler
          },
          {
            path: ':contactId',
            name: RouteName.INT_HOUSING_CONTACT_PAGE,
            component: () => import('@/views/internal/housing/contact/ContactPageView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: { breadcrumb: 'Contact Details' }
          }
        ]
      },
      {
        path: 'user',
        name: RouteName.INT_HOUSING_USER_MANAGEMENT,
        component: () => import('@/views/internal/user/UserManagementView.vue'),
        beforeEnter: accessHandler,
        meta: {
          access: [NavigationPermission.INT_USER_MANAGEMENT],
          breadcrumb: 'User management',
          requiresAuth: true
        }
      }
    ]
  }
];

export default routes;
