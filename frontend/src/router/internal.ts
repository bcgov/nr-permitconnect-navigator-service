import { accessHandler } from '@/router';
import { default as internalElectrificationRoutes } from '@/router/internalElectrification';
import { default as internalHousingRoutes } from '@/router/internalHousing';
import { NavigationPermission } from '@/store/authzStore';
import { RouteName } from '@/utils/enums/application';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/i',
    children: [
      {
        path: 'user',
        name: RouteName.INT_USER_MANAGEMENT,
        component: () => import('@/views/internal/user/UserManagementView.vue'),
        beforeEnter: accessHandler,
        meta: {
          access: [NavigationPermission.INT_USER_MANAGEMENT],
          breadcrumb: 'User management',
          requiresAuth: true
        }
      },

      ...internalElectrificationRoutes,
      ...internalHousingRoutes
    ]
  }
];

export default routes;
