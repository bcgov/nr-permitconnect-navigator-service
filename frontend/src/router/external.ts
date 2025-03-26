import { default as externalElectrificationRoutes } from '@/router/externalElectrification';
import { default as externalHousingRoutes } from '@/router/externalHousing';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/e',
    children: [...externalElectrificationRoutes, ...externalHousingRoutes]
  }
];

export default routes;
