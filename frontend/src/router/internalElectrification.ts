import { accessHandler, createProps, entryRedirect } from '@/router';
import { useAppStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'electrification',
    beforeEnter: [entryRedirect, () => useAppStore().setInitiative(Initiative.ELECTRIFICATION)],
    meta: { access: [NavigationPermission.INT_ELECTRIFICATION], breadcrumb: 'Submissions', requiresAuth: true },
    children: [
      {
        path: '',
        name: RouteName.INT_ELECTRIFICATION,
        component: () => import('@/views/internal/electrification/ElectrificationView.vue'),
        beforeEnter: accessHandler
      },
      {
        path: 'project/:projectId',
        component: () => import('@/views/GenericView.vue'),
        meta: { dynamicBreadcrumb: 'project' },
        children: [
          {
            path: '',
            name: RouteName.INT_ELECTRIFICATION_PROJECT,
            component: () => import('@/views/internal/electrification/project/ProjectView.vue'),
            beforeEnter: accessHandler,
            props: createProps
          },
          {
            path: 'enquiry',
            component: () => import('@/views/GenericView.vue'),
            children: [
              {
                path: ':enquiryId',
                name: RouteName.INT_ELECTRIFICATION_PROJECT_ENQUIRY,
                component: () => import('@/views/internal/electrification/enquiry/EnquiryView.vue'),
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
                name: RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT,
                // TODO: Consider creating reuse component from view so we can create a separate internal view
                component: () => import('@/views/external/electrification/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps
              },
              {
                path: ':permitId',
                name: RouteName.INT_ELECTRIFICATION_PROJECT_PROPONENT_PERMIT,
                // TODO: Consider creating reuse component from view so we can create a separate internal view
                component: () => import('@/views/external/electrification/permit/PermitStatusView.vue'),
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
            name: RouteName.INT_ELECTRIFICATION_ENQUIRY,
            component: () => import('@/views/internal/electrification/enquiry/EnquiryView.vue'),
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
