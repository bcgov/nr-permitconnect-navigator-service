import { accessHandler, createProps, entryRedirect } from '@/router';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'housing',
    beforeEnter: entryRedirect,
    meta: { access: [NavigationPermission.INT_HOUSING], breadcrumb: 'Submissions', requiresAuth: true },
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
            meta: { dynamicBreadcrumb: 'enquiry' }
          }
        ]
      }
    ]
  }
];

export default routes;
