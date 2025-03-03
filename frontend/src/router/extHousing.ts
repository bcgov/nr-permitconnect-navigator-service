import { accessHandler, createProps, entryRedirect } from '@/router';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/e/housing',
    meta: { access: [NavigationPermission.EXT_HOUSING], breadcrumb: 'Housing', requiresAuth: true },
    beforeEnter: entryRedirect,
    children: [
      {
        path: '',
        name: RouteName.EXT_HOUSING,
        component: () => import('../views/housing/HousingView.vue'),
        beforeEnter: accessHandler
      },
      {
        path: 'enquiry',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: '',
            name: RouteName.EXT_HOUSING_ENQUIRY_INTAKE,
            component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Enquiry Form'
            }
          },
          {
            path: ':enquiryId',
            name: RouteName.EXT_HOUSING_ENQUIRY,
            component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Enquiry Form'
            }
          },
          {
            path: ':enquiryId/confirmation',
            name: RouteName.EXT_HOUSING_ENQUIRY_CONFIRMATION,
            component: () => import('@/views/housing/enquiry/EnquiryConfirmationView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              hideBreadcrumb: true
            }
          }
        ]
      },
      {
        path: 'intake',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: '',
            name: RouteName.EXT_HOUSING_INTAKE,
            component: () => import('@/views/housing/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Project Intake Form'
            }
          },
          {
            path: ':draftId',
            name: RouteName.EXT_HOUSING_INTAKE_DRAFT,
            component: () => import('@/views/housing/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Project Intake Form'
            }
          },
          {
            path: ':submissionId/confirmation',
            name: RouteName.EXT_HOUSING_INTAKE_CONFIRMATION,
            component: () => import('@/views/housing/project/ProjectConfirmationView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              hideBreadcrumb: true
            }
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
            children: [
              {
                path: '',
                name: RouteName.EXT_HOUSING_PROJECT,
                component: () => import('@/views/housing/project/ProjectView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Project',
                  breadcrumb_dynamic: true
                }
              },
              {
                path: 'enquiry',
                component: () => import('@/views/GenericView.vue'),
                children: [
                  {
                    path: '',
                    name: RouteName.EXT_HOUSING_PROJECT_ENQUIRY,
                    component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: {
                      breadcrumb: 'Enquiry Form'
                    }
                  },
                  {
                    path: ':enquiryId/confirmation',
                    name: RouteName.EXT_HOUSING_PROJECT_ENQUIRY_CONFIRMATION,
                    component: () => import('@/views/housing/enquiry/EnquiryConfirmationView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: {
                      hideBreadcrumb: true
                    }
                  }
                ]
              },
              {
                path: 'intake',
                name: RouteName.EXT_HOUSING_PROJECT_INTAKE,
                component: () => import('@/views/housing/project/ProjectIntakeView.vue'),
                beforeEnter: accessHandler,
                props: createProps,
                meta: {
                  breadcrumb: 'Project Intake Form'
                }
              },
              {
                path: 'permit/:permitId',
                component: () => import('@/views/GenericView.vue'),
                children: [
                  {
                    path: '',
                    name: RouteName.EXT_HOUSING_PROJECT_PERMIT,
                    component: () => import('@/views/permit/PermitStatusView.vue'),
                    beforeEnter: accessHandler,
                    props: createProps,
                    meta: {
                      breadcrumb: 'Permit',
                      breadcrumb_dynamic: true
                    }
                  },
                  {
                    path: 'enquiry',
                    component: () => import('@/views/GenericView.vue'),
                    children: [
                      {
                        path: '',
                        name: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY,
                        component: () => import('@/views/housing/enquiry/EnquiryIntakeView.vue'),
                        beforeEnter: accessHandler,
                        props: createProps,
                        meta: {
                          breadcrumb: 'Enquiry Form'
                        }
                      },
                      {
                        path: ':enquiryId/confirmation',
                        name: RouteName.EXT_HOUSING_PROJECT_PERMIT_ENQUIRY_CONFIRMATION,
                        component: () => import('@/views/housing/enquiry/EnquiryConfirmationView.vue'),
                        beforeEnter: accessHandler,
                        props: createProps,
                        meta: {
                          hideBreadcrumb: true
                        }
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
        component: () => import('@/views/ComingSoon.vue'),
        meta: { access: [NavigationPermission.EXT_HOUSING] }
      }
    ]
  }
];

export default routes;
