import { default as externalElectrificationRoutes } from '@/router/externalElectrification';
import { default as externalHousingRoutes } from '@/router/externalHousing';
import { useAppStore } from '@/store';
import { Zone } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/e',
    beforeEnter: [() => useAppStore().setZone(Zone.EXTERNAL)],
    children: [...externalElectrificationRoutes, ...externalHousingRoutes]
  }
];

export default routes;
