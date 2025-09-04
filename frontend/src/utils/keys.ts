import type { InjectionKey } from 'vue';

import type { IDraftableProjectService, IProjectService } from '@/interfaces/IProjectService';
import type { NavigationPermission } from '@/store/authzStore';
import type { Resource, RouteName } from '@/utils/enums/application';

// Constants
export const atsEnquiryPartnerAgenciesKey = Symbol() as InjectionKey<string>;
export const atsEnquiryTypeCodeKey = Symbol() as InjectionKey<string>;

// Permissions
export const navigationPermissionKey = Symbol() as InjectionKey<NavigationPermission>;

// Resources
export const resourceKey = Symbol() as InjectionKey<Resource>;

// RouteNames
export const contactInitiativeRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryPermitConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryProjectConfirmRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const enquiryNoteRouteNameKey = Symbol() as InjectionKey<RouteName>;
export const projectRouteNameKey = Symbol() as InjectionKey<RouteName>;

// Services
export const projectServiceKey = Symbol() as InjectionKey<IProjectService>;
export const draftableProjectServiceKey = Symbol() as InjectionKey<IDraftableProjectService>;
