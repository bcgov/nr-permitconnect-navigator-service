import { accessHandler, createProps, entryRedirect } from '@/router';
import { useAppStore } from '@/store';
import { NavigationPermission } from '@/store/authzStore';
import { Initiative, RouteName } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: 'electrification',
    meta: { access: [NavigationPermission.EXT_ELECTRIFICATION], breadcrumb: 'Electrification', requiresAuth: true },
    beforeEnter: [entryRedirect, () => useAppStore().setInitiative(Initiative.ELECTRIFICATION)],
    children: [
      // {
      //   path: '',
      //   name: RouteName.EXT_ELECTRIFICATION,
      //   component: () => import('../views/external/electrification/HousingView.vue'),
      //   beforeEnter: accessHandler
      // },
      // {
      //   path: 'enquiry',
      //   component: () => import('@/views/GenericView.vue'),
      //   children: [
      //     {
      //       path: '',
      //       name: RouteName.EXT_ELECTRIFICATION_ENQUIRY_INTAKE,
      //       component: () => import('@/views/external/electrification/enquiry/EnquiryIntakeView.vue'),
      //       beforeEnter: accessHandler,
      //       props: createProps,
      //       meta: {
      //         breadcrumb: 'Enquiry Form'
      //       }
      //     },
      //     {
      //       path: ':enquiryId',
      //       name: RouteName.EXT_ELECTRIFICATION_ENQUIRY,
      //       component: () => import('@/views/external/electrification/enquiry/EnquiryIntakeView.vue'),
      //       beforeEnter: accessHandler,
      //       props: createProps,
      //       meta: {
      //         breadcrumb: 'Enquiry Form'
      //       }
      //     },
      //     {
      //       path: ':enquiryId/confirmation',
      //       name: RouteName.EXT_ELECTRIFICATION_ENQUIRY_CONFIRMATION,
      //       component: () => import('@/views/external/electrification/enquiry/EnquiryConfirmationView.vue'),
      //       beforeEnter: accessHandler,
      //       props: createProps,
      //       meta: {
      //         hideBreadcrumb: true
      //       }
      //     }
      //   ]
      // },
      {
        path: 'intake',
        component: () => import('@/views/GenericView.vue'),
        children: [
          {
            path: '',
            name: RouteName.EXT_ELECTRIFICATION_INTAKE,
            component: () => import('@/views/external/electrification/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Project Intake Form'
            }
          },
          {
            path: ':draftId',
            name: RouteName.EXT_ELECTRIFICATION_INTAKE_DRAFT,
            component: () => import('@/views/external/electrification/project/ProjectIntakeView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb: 'Project Intake Form'
            }
          },
          {
            path: ':projectId/confirmation',
            name: RouteName.EXT_ELECTRIFICATION_INTAKE_CONFIRMATION,
            component: () => import('@/views/external/electrification/project/ProjectConfirmationView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              hideBreadcrumb: true
            }
          }
        ]
      }
      // {
      //   path: 'project',
      //   component: () => import('@/views/GenericView.vue'),
      //   children: [
      //     {
      //       path: ':projectId',
      //       component: () => import('@/views/GenericView.vue'),
      //       children: [
      //         {
      //           path: '',
      //           name: RouteName.EXT_ELECTRIFICATION_PROJECT,
      //           component: () => import('@/views/external/electrification/project/ProjectView.vue'),
      //           beforeEnter: accessHandler,
      //           props: createProps,
      //           meta: {
      //             breadcrumb: 'Project',
      //             breadcrumb_dynamic: true
      //           }
      //         },
      //         {
      //           path: 'enquiry',
      //           component: () => import('@/views/GenericView.vue'),
      //           children: [
      //             {
      //               path: '',
      //               name: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY,
      //               component: () => import('@/views/external/electrification/enquiry/EnquiryIntakeView.vue'),
      //               beforeEnter: accessHandler,
      //               props: createProps,
      //               meta: {
      //                 breadcrumb: 'Enquiry Form'
      //               }
      //             },
      //             {
      //               path: ':enquiryId/confirmation',
      //               name: RouteName.EXT_ELECTRIFICATION_PROJECT_ENQUIRY_CONFIRMATION,
      //               component: () => import('@/views/external/electrification/enquiry/EnquiryConfirmationView.vue'),
      //               beforeEnter: accessHandler,
      //               props: createProps,
      //               meta: {
      //                 hideBreadcrumb: true
      //               }
      //             }
      //           ]
      //         },
      //         {
      //           path: 'intake',
      //           name: RouteName.EXT_ELECTRIFICATION_PROJECT_INTAKE,
      //           component: () => import('@/views/external/electrification/project/ProjectIntakeView.vue'),
      //           beforeEnter: accessHandler,
      //           props: createProps,
      //           meta: {
      //             breadcrumb: 'Project Intake Form'
      //           }
      //         },
      //         {
      //           path: 'permit/:permitId',
      //           component: () => import('@/views/GenericView.vue'),
      //           children: [
      //             {
      //               path: '',
      //               name: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT,
      //               component: () => import('@/views/external/electrification/permit/PermitStatusView.vue'),
      //               beforeEnter: accessHandler,
      //               props: createProps,
      //               meta: {
      //                 breadcrumb: 'Permit',
      //                 breadcrumb_dynamic: true
      //               }
      //             },
      //             {
      //               path: 'enquiry',
      //               component: () => import('@/views/GenericView.vue'),
      //               children: [
      //                 {
      //                   path: '',
      //                   name: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY,
      //                   component: () => import('@/views/external/electrification/enquiry/EnquiryIntakeView.vue'),
      //                   beforeEnter: accessHandler,
      //                   props: createProps,
      //                   meta: {
      //                     breadcrumb: 'Enquiry Form'
      //                   }
      //                 },
      //                 {
      //                   path: ':enquiryId/confirmation',
      //                   name: RouteName.EXT_ELECTRIFICATION_PROJECT_PERMIT_ENQUIRY_CONFIRMATION,
      //              component: () => import('@/views/external/electrification/enquiry/EnquiryConfirmationView.vue'),
      //                   beforeEnter: accessHandler,
      //                   props: createProps,
      //                   meta: {
      //                     hideBreadcrumb: true
      //                   }
      //                 }
      //               ]
      //             }
      //           ]
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   path: 'guide',
      //   name: RouteName.EXT_ELECTRIFICATION_GUIDE,
      //   component: () => import('@/views/ComingSoonView.vue'),
      //   meta: { access: [NavigationPermission.EXT_ELECTRIFICATION] }
      // }
    ]
  }
];

export default routes;
