import internalElectrificationRoutes from '@/router/internalElectrification';
import internalGeneralRoutes from '@/router/internalGeneral';
import internalHousingRoutes from '@/router/internalHousing';
import { useAppStore } from '@/store';
import { Zone } from '@/utils/enums/application';

import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/i',
    beforeEnter: [() => useAppStore().setZone(Zone.INTERNAL)],
    children: [...internalElectrificationRoutes, ...internalGeneralRoutes, ...internalHousingRoutes]
  }
];

export default routes;
