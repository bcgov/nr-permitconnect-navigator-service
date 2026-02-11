import type { InjectionKey, Ref } from 'vue';

import type { IDraftableProjectService, IProjectService } from '@/interfaces/IProjectService';
import type { NavigationPermission } from '@/store/authzStore';
import type { Resource, RouteName } from '@/utils/enums/application';

// Constants
export const atsEnquiryPartnerAgenciesKey = Symbol() as InjectionKey<Ref<string>>;
export const atsEnquiryTypeCodeKey = Symbol() as InjectionKey<Ref<string>>;

// Permissions
export const navigationPermissionKey = Symbol() as InjectionKey<Ref<NavigationPermission>>;

// Resources
export const resourceKey = Symbol() as InjectionKey<Ref<Resource>>;

// RouteNames
export const contactRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName | undefined>>;
export const enquiryPermitConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryProjectConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryRouteNameKey = Symbol() as InjectionKey<Ref<RouteName | undefined>>;
export const projectIntakeRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectRouteNameKey = Symbol() as InjectionKey<Ref<RouteName | undefined>>;

// Services
export const projectServiceKey = Symbol() as InjectionKey<Ref<IProjectService>>;
export const draftableProjectServiceKey = Symbol() as InjectionKey<Ref<IDraftableProjectService>>;
