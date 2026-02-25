import internalElectrificationRoutes from '@/router/internalElectrification';
import internalHousingRoutes from '@/router/internalHousing';
import { useAppStore } from '@/store';
import { Zone } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/i',
    beforeEnter: [() => useAppStore().setZone(Zone.INTERNAL)],
    children: [...internalElectrificationRoutes, ...internalHousingRoutes]
  }
];

export default routes;
