import { default as externalHousingRoutes } from '@/router/externalHousing';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/e',
    children: [...externalHousingRoutes]
  }
];

export default routes;
