import { accessHandler, createProps, entryRedirect } from '@/router';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/i/housing',
    meta: { access: [NavigationPermission.INT_HOUSING], breadcrumb: 'Housing', requiresAuth: true },
    beforeEnter: entryRedirect,
    children: [
      {
        path: '',
        name: RouteName.INT_HOUSING,
        component: () => import('@/views/housing/SubmissionsView.vue'),
        beforeEnter: accessHandler
      },
      {
        path: 'project/:submissionId',
        component: () => import('@/views/GenericView.vue'),
        meta: {
          breadcrumb: 'Project',
          breadcrumb_dynamic: true
        },
        children: [
          {
            path: '',
            name: RouteName.INT_HOUSING_PROJECT,
            component: () => import('@/views/housing/submission/SubmissionView.vue'),
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
                component: () => import('@/views/housing/enquiry/EnquiryView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Permit',
                  breadcrumb_dynamic: true
                }
              }
            ]
          },
          {
            path: 'proponent',
            component: () => import('@/views/GenericView.vue'),
            children: [
              {
                path: '',
                name: RouteName.INT_HOUSING_PROJECT_PROPONENT,
                component: () => import('@/views/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Proponent view'
                }
              },
              {
                path: ':permitId',
                name: RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT,
                component: () => import('@/views/permit/PermitStatusView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Permit',
                  breadcrumb_dynamic: true
                }
              }
            ]
          }
        ]
      },
      {
        path: 'enquiry',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: ':enquiryId',
            name: RouteName.INT_HOUSING_ENQUIRY,
            component: () => import('@/views/housing/enquiry/EnquiryView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Enquiry',
              breadcrumb_dynamic: true
            }
          }
        ]
      },
      {
        path: 'user',
        name: RouteName.INT_HOUSING_USER_MANAGEMENT,
        component: () => import('@/views/user/UserManagementView.vue'),
        beforeEnter: accessHandler,
        meta: {
          access: [NavigationPermission.INT_HOUSING_USER_MANAGEMENT],
          breadcrumb: 'User management',
          requiresAuth: true
        }
      }
    ]
  }
];

export default routes;
