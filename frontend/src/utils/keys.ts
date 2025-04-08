import type { InjectionKey } from 'vue';

import type { IProjectService } from '@/interfaces/IProjectService';
import type { Resource, RouteName } from '@/utils/enums/application';

export const projectServiceKey = Symbol() as InjectionKey<IProjectService>;
export const resourceKey = Symbol() as InjectionKey<Resource>;
export const projectRouteNameKey = Symbol() as InjectionKey<RouteName>;
