import type { InjectionKey, Ref } from 'vue';

import type { IDraftableProjectService, IProjectService } from '@/interfaces/IProjectService';
import type { NavigationPermission } from '@/store/authzStore';
import type { Resource, RouteName } from '@/utils/enums/application';

// Constants
export const atsEnquiryPartnerAgenciesKey: InjectionKey<Ref<string>> = Symbol();
export const atsEnquiryTypeCodeKey: InjectionKey<Ref<string>> = Symbol();

// Form
export const updateLiveNameKey: InjectionKey<(name: string) => void> = Symbol();

// Permissions
export const navigationPermissionKey: InjectionKey<Ref<NavigationPermission>> = Symbol();

// Resources
export const resourceKey: InjectionKey<Ref<Resource>> = Symbol();

// RouteNames
export const contactRouteNameKey: InjectionKey<Ref<RouteName>> = Symbol();
export const enquiryConfirmRouteNameKey: InjectionKey<Ref<RouteName | undefined>> = Symbol();
export const enquiryPermitConfirmRouteNameKey: InjectionKey<Ref<RouteName>> = Symbol();
export const enquiryProjectConfirmRouteNameKey: InjectionKey<Ref<RouteName>> = Symbol();
export const enquiryRouteNameKey: InjectionKey<Ref<RouteName | undefined>> = Symbol();
export const projectAuthorizationRouteNameKey: InjectionKey<Ref<RouteName | undefined>> = Symbol();
export const projectIntakeRouteNameKey: InjectionKey<Ref<RouteName>> = Symbol();
export const projectNoteRouteNameKey: InjectionKey<Ref<RouteName>> = Symbol();
export const projectRouteNameKey: InjectionKey<Ref<RouteName | undefined>> = Symbol();

// Services
export const projectServiceKey: InjectionKey<Ref<IProjectService>> = Symbol();
export const draftableProjectServiceKey: InjectionKey<Ref<IDraftableProjectService>> = Symbol();
