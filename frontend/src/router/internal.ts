import { accessHandler, createProps, entryRedirect } from '@/router';
import { default as internalHousingRoutes } from '@/router/internalHousing';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/i',
    children: [
      {
        path: 'contact',
        meta: { access: [NavigationPermission.INT_CONTACT], breadcrumb: 'Contacts', requiresAuth: true },
        beforeEnter: entryRedirect,
        children: [
          {
            path: '',
            name: RouteName.INT_CONTACT,
            component: () => import('@/views/contact/ContactsView.vue'),
            beforeEnter: accessHandler
          },
          {
            path: ':contactId',
            name: RouteName.INT_CONTACT_PAGE,
            component: () => import('@/views/contact/ContactPageView.vue'),
            beforeEnter: accessHandler,
            props: createProps,
            meta: {
              breadcrumb_dynamic: true
            }
          }
        ]
      },
      {
        path: 'user',
        name: RouteName.INT_USER_MANAGEMENT,
        component: () => import('@/views/user/UserManagementView.vue'),
        beforeEnter: accessHandler,
        meta: {
          access: [NavigationPermission.INT_USER_MANAGEMENT],
          breadcrumb: 'User management',
          requiresAuth: true
        }
      },

      ...internalHousingRoutes
    ]
  }
];

export default routes;
