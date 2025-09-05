import type { InjectionKey, Ref } from 'vue';

import { enquiryService } from '@/services';

import type { IDraftableProjectService, IProjectService } from '@/interfaces/IProjectService';
import type { NavigationPermission } from '@/store/authzStore';
import type { Resource, RouteName } from '@/utils/enums/application';

// Constants
export const atsEnquiryPartnerAgenciesKey = Symbol() as InjectionKey<string>;
export const atsEnquiryTypeCodeKey = Symbol() as InjectionKey<string>;

// Permissions
export const navigationPermissionKey = Symbol() as InjectionKey<NavigationPermission>;

// Resources
export const resourceKey = Symbol() as InjectionKey<Ref<Resource>>;

// RouteNames
export const contactInitiativeRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryPermitConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryProjectConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const projectRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;

// Services
export const enquiryServiceKey = Symbol() as InjectionKey<typeof enquiryService>;
export const projectServiceKey = Symbol() as InjectionKey<Ref<IProjectService>>;
export const draftableProjectServiceKey = Symbol() as InjectionKey<Ref<IDraftableProjectService>>;
