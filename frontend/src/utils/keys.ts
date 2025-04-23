import type { InjectionKey } from 'vue';

import type { IProjectService } from '@/interfaces/IProjectService';
import type { Resource, RouteName } from '@/utils/enums/application';

export const contactInitiativeRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const projectRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const projectServiceKey = Symbol() as InjectionKey<IProjectService>;
export const resourceKey = Symbol() as InjectionKey<Resource>;
