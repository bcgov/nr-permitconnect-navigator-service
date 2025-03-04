import { RouteName } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';
import { accessHandler } from '@/router';
import { NavigationPermission } from '@/store/authzStore';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/contact',
    meta: { hideBreadcrumb: true },
    children: [
      {
        path: '',
        name: RouteName.CONTACT,
        component: () => import('@/views/contact/ContactProfileView.vue'),
        beforeEnter: accessHandler,
        meta: { requiresAuth: true, access: [NavigationPermission.GLO_USER] }
      }
    ]
  }
];

export default routes;
