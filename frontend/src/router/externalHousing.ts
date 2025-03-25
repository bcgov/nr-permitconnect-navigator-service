import { accessHandler, createProps, entryRedirect } from '@/router';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'housing',
    meta: { access: [NavigationPermission.EXT_HOUSING], breadcrumb: 'Housing', requiresAuth: true },
    beforeEnter: entryRedirect,
    children: [
      {
        path: '',
        name: RouteName.EXT_HOUSING,
        component: () => import('../views/external/housing/HousingView.vue'),
        beforeEnter: accessHandler
      },
      {
        path: 'enquiry',
        component: () => import('@/views/GenericView.vue'),
        meta: { breadcrumb: 'Enquiry Form' },
        children: [
          {
            path: '',
            name: RouteName.EXT_HOUSING_ENQUIRY_INTAKE,
            component: () => import('@/views/external/housing/enquiry/EnquiryIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps
          },
          {
            path: ':enquiryId',
            name: RouteName.EXT_HOUSING_ENQUIRY,
            component: () => import('@/views/external/housing/enquiry/EnquiryIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps
          },
          {
            path: ':enquiryId/confirmation',
            name: RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION,
            component: () => import('@/views/external/housing/enquiry/EnquiryConfirmationView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: { hideBreadcrumb: true }
          }
        ]
      },
      {
        path: 'intake',
        component: () => import('@/views/GenericView.vue'),
        meta: { breadcrumb: 'Project Intake Form' },
        children: [
          {
            path: '',
            name: RouteName.EXT_HOUSING_INTAKE,
            component: () => import('@/views/external/housing/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps
          },
          {
            path: ':draftId',
            name: RouteName.EXT_HOUSING_INTAKE_DRAFT,
            component: () => import('@/views/external/housing/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps
          },
          {
            path: ':submissionId/confirmation',
            name: RouteName.EXT_HOUSING_INTAKE_CONFIRMATION,
            component: () => import('@/views/external/housing/project/ProjectConfirmationView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: { hideBreadcrumb: true }
          }
        ]
      },
      {
        path: 'project',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: ':submissionId',
            component: () => import('@/views/GenericView.vue'),
            meta: { dynamicBreadcrumb: 'project' },
            children: [
              {
                path: '',
                name: RouteName.EXT_HOUSING_PROJECT,
                component: () => import('@/views/external/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps
              },
              {
                path: 'enquiry',
                component: () => import('@/views/GenericView.vue'),
                meta: { breadcrumb: 'Enquiry Form' },
                children: [
                  {
                    path: '',
                    name: RouteName.EXT_HOUSING_PROJECT_ENQUIRY,
                    component: () => import('@/views/external/housing/enquiry/EnquiryIntakeView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  },
                  {
                    path: ':enquiryId',
                    name: RouteName.EXT_HOUSING_PROJECT_RELATED_ENQUIRY,
                    component: () => import('@/views/external/housing/enquiry/EnquiryIntakeView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  },
                  {
                    path: ':enquiryId/confirmation',
                    name: RouteName.EXT_HOUSING_PROJECT_ENQUIRY_CONFIRMATION,
                    component: () => import('@/views/external/housing/enquiry/EnquiryConfirmationView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: { hideBreadcrumb: true }
                  }
                ]
              },
              {
                path: 'intake',
                name: RouteName.EXT_HOUSING_PROJECT_INTAKE,
                component: () => import('@/views/external/housing/project/ProjectIntakeView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: { breadcrumb: 'Project Intake Form' }
              },
              {
                path: 'permit/:permitId',
                component: () => import('@/views/GenericView.vue'),
                meta: { dynamicBreadcrumb: 'permit' },
                children: [
                  {
                    path: '',
                    name: RouteName.EXT_HOUSING_PROJECT_PERMIT,
                    component: () => import('@/views/external/housing/permit/PermitStatusView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps
                  },
                  {
                    path: 'enquiry',
                    component: () => import('@/views/GenericView.vue'),
                    meta: { breadcrumb: 'Enquiry Form' },
                    children: [
                      {
                        path: '',
                        name: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY,
                        component: () => import('@/views/external/housing/enquiry/EnquiryIntakeView.vue'),
                        beforeEnter: accessHandler,
                        props: createProps
                      },
                      {
                        path: ':enquiryId/confirmation',
                        name: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY_CONFIRMATION,
                        component: () => import('@/views/external/housing/enquiry/EnquiryConfirmationView.vue'),
                        beforeEnter: accessHandler,
                        props: createProps,
                        meta: { hideBreadcrumb: true }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        path: 'guide',
        name: RouteName.EXT_HOUSING_GUIDE,
        component: () => import('@/views/ComingSoonView.vue'),
        meta: { access: [NavigationPermission.EXT_HOUSING] }
      }
    ]
  }
];

export default routes;
