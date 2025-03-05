import { accessHandler, createProps, entryRedirect } from '@/router';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'housing',
    meta: { access: [NavigationPermission.INT_HOUSING], breadcrumb: 'Housing', requiresAuth: true },
    beforeEnter: entryRedirect,
    children: [
      {
        path: '',
        name: RouteName.INT_HOUSING,
        component: () => import('@/views/internal/housing/HousingView.vue'),
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
                // TODO: Do we want to make an internal view that uses the same components?
                component: () => import('@/views/external/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Proponent view'
                }
              },
              {
                path: ':permitId',
                name: RouteName.INT_HOUSING_PROJECT_PROPONENT_PERMIT,
                // TODO: Do we want to make an internal view that uses the same components?
                component: () => import('@/views/external/housing/permit/PermitStatusView.vue'),
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
            component: () => import('@/views/internal/housing/enquiry/EnquiryView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Enquiry',
              breadcrumb_dynamic: true
            }
          }
        ]
      }
    ]
  }
];

export default routes;
