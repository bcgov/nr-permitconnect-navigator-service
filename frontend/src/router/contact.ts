import { RouteName } from '@/utils/enums/application';

import { accessHandler } from '@/router';
import { NavigationPermission } from '@/store/authzStore';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contact',
    meta: { hideBreadcrumb: true },
    children: [
      {
        path: '',
        name: RouteName.CONTACT,
        component: () => import('@/views/contact/ContactView.vue'),
        beforeEnter: accessHandler,
        meta: { requiresAuth: true, access: [NavigationPermission.GLO_USER] }
      }
    ]
  }
];

export default routes;
