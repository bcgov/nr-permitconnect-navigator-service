import type { InjectionKey, Ref } from 'vue';

import { enquiryService } from '@/services';

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
export const enquiryConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName | undefined>>;
export const enquiryNoteRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryPermitConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryProjectConfirmRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const enquiryRouteNameKey = Symbol() as InjectionKey<Ref<RouteName | undefined>>;
export const initiativeRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const initiativeContactRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectAddAuthorizationRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectAuthorizationRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectIntakeRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectNoteRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectProponentNameKey = Symbol() as InjectionKey<Ref<RouteName>>;
export const projectRouteNameKey = Symbol() as InjectionKey<Ref<RouteName>>;

// Services
export const enquiryServiceKey = Symbol() as InjectionKey<typeof enquiryService>;
export const projectServiceKey = Symbol() as InjectionKey<Ref<IProjectService>>;
export const draftableProjectServiceKey = Symbol() as InjectionKey<Ref<IDraftableProjectService>>;
