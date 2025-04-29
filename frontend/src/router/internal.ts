import { default as internalElectrificationRoutes } from '@/router/internalElectrification';
import { default as internalHousingRoutes } from '@/router/internalHousing';

import { type RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/i',
    children: [...internalElectrificationRoutes, ...internalHousingRoutes]
  }
];

export default routes;
