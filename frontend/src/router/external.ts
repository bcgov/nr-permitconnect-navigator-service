import externalElectrificationRoutes from '@/router/externalElectrification';
import externalHousingRoutes from '@/router/externalHousing';
import { useAppStore, useContactStore } from '@/store';
import { RouteName, StorageKey, Zone } from '@/utils/enums/application';

import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router';

function newContactRedirect(to: RouteLocationNormalized) {
  if (useContactStore().needsContactDetails) {
    globalThis.sessionStorage.setItem(StorageKey.CONTACT_REDIRECT, `${to.fullPath}`);
    return { name: RouteName.CONTACT };
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/e',
    beforeEnter: [newContactRedirect, () => useAppStore().setZone(Zone.EXTERNAL)],
    children: [...externalElectrificationRoutes, ...externalHousingRoutes]
  }
];

export default routes;
