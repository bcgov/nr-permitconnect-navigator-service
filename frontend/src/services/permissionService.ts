import { AccessRole } from '@/utils/enums/application';
import { appAxios } from './interceptors';

import { useAuthStore } from '@/store';

export enum Permissions {
  HOUSING_BRINGFORWARD_READ = 'housing.bringforward.read',

  HOUSING_ENQUIRY_CREATE = 'housing.enquiry.create',
  HOUSING_ENQUIRY_READ = 'housing.enquiry.read',
  HOUSING_ENQUIRY_READ_SELF = 'housing.enquiry.read.self',
  HOUSING_ENQUIRY_UPDATE = 'housing.enquiry.update',
  HOUSING_ENQUIRY_DELETE = 'housing.enquiry.delete',

  HOUSING_SUBMISSION_CREATE = 'housing.submission.create',
  HOUSING_SUBMISSION_READ = 'housing.submission.read',
  HOUSING_SUBMISSION_READ_SELF = 'housing.submission.read.self',
  HOUSING_SUBMISSION_UPDATE = 'housing.submission.update',
  HOUSING_SUBMISSION_DELETE = 'housing.submission.delete',

  NAVIGATION_HOUSING = 'housing',
  NAVIGATION_HOUSING_DROPDOWN = 'housing.dropdown',
  NAVIGATION_HOUSING_ENQUIRY = 'housing.enquiry',
  NAVIGATION_HOUSING_INTAKE = 'housing.intake',
  NAVIGATION_HOUSING_SUBMISSION = 'housing.submission',
  NAVIGATION_HOUSING_SUBMISSIONS = 'housing.submissions',
  NAVIGATION_HOUSING_SUBMISSIONS_SUB = 'housing.submissions.sub',
  NAVIGATION_HOUSING_STATUS_TRACKER = 'housing.status.tracker',
  NAVIGATION_HOUSING_USER_MANAGEMENT = 'housing.usermanagement',
  NAVIGATION_DEVELOPER = 'developer',

  TESTING_ROLE_OVERRIDE = 'testing.role.override'
}

const PermissionMap = [
  {
    role: AccessRole.PCNS_ADMIN,
    permissions: [
      Permissions.HOUSING_ENQUIRY_READ,

      Permissions.HOUSING_SUBMISSION_READ,

      Permissions.NAVIGATION_HOUSING_DROPDOWN,
      Permissions.NAVIGATION_HOUSING_STATUS_TRACKER,
      Permissions.NAVIGATION_HOUSING_SUBMISSION,
      Permissions.NAVIGATION_HOUSING_SUBMISSIONS,
      Permissions.NAVIGATION_HOUSING_USER_MANAGEMENT
    ]
  },
  {
    role: AccessRole.PCNS_NAVIGATOR,
    permissions: [
      Permissions.HOUSING_BRINGFORWARD_READ,

      Permissions.HOUSING_ENQUIRY_READ,
      Permissions.HOUSING_ENQUIRY_UPDATE,
      Permissions.HOUSING_ENQUIRY_DELETE,

      Permissions.HOUSING_SUBMISSION_CREATE,
      Permissions.HOUSING_SUBMISSION_READ,
      Permissions.HOUSING_SUBMISSION_UPDATE,
      Permissions.HOUSING_SUBMISSION_DELETE,

      Permissions.NAVIGATION_HOUSING_DROPDOWN,
      Permissions.NAVIGATION_HOUSING_STATUS_TRACKER,
      Permissions.NAVIGATION_HOUSING_SUBMISSION,
      Permissions.NAVIGATION_HOUSING_SUBMISSIONS
    ]
  },
  {
    role: AccessRole.PCNS_PROPONENT,
    permissions: [
      Permissions.HOUSING_ENQUIRY_CREATE,
      Permissions.HOUSING_ENQUIRY_READ_SELF,
      Permissions.HOUSING_ENQUIRY_UPDATE,
      Permissions.HOUSING_ENQUIRY_DELETE,

      Permissions.HOUSING_SUBMISSION_CREATE,
      Permissions.HOUSING_SUBMISSION_READ_SELF,
      Permissions.HOUSING_SUBMISSION_UPDATE,
      Permissions.HOUSING_SUBMISSION_DELETE,

      Permissions.NAVIGATION_HOUSING,
      Permissions.NAVIGATION_HOUSING_DROPDOWN,
      Permissions.NAVIGATION_HOUSING_ENQUIRY,
      Permissions.NAVIGATION_HOUSING_INTAKE,
      Permissions.NAVIGATION_HOUSING_SUBMISSION,
      Permissions.NAVIGATION_HOUSING_SUBMISSIONS_SUB
    ]
  },
  {
    role: AccessRole.PCNS_SUPERVISOR,
    permissions: [
      Permissions.HOUSING_BRINGFORWARD_READ,

      Permissions.HOUSING_ENQUIRY_READ,
      Permissions.HOUSING_ENQUIRY_UPDATE,
      Permissions.HOUSING_ENQUIRY_DELETE,

      Permissions.HOUSING_SUBMISSION_CREATE,
      Permissions.HOUSING_SUBMISSION_READ,
      Permissions.HOUSING_SUBMISSION_UPDATE,
      Permissions.HOUSING_SUBMISSION_DELETE,

      Permissions.NAVIGATION_HOUSING_DROPDOWN,
      Permissions.NAVIGATION_HOUSING_STATUS_TRACKER,
      Permissions.NAVIGATION_HOUSING_SUBMISSION,
      Permissions.NAVIGATION_HOUSING_SUBMISSIONS,
      Permissions.NAVIGATION_HOUSING_USER_MANAGEMENT
    ]
  }
];

/**
 * @class PermissionService
 * A singleton wrapper for managing role access
 */
export default class PermissionService {
  private static _instance: PermissionService;

  private static _roleOverride: string | undefined;

  /**
   * @constructor
   */
  constructor() {
    if (!PermissionService._instance) {
      PermissionService._instance = this;
    }

    return PermissionService._instance;
  }

  /**
   * @function init
   * Initializes the PermissionService singleton
   * @returns {Promise<PermissionService>} An instance of PermissionService
   */
  public static async init(): Promise<PermissionService> {
    return new Promise((resolve) => {
      const permissionService = new PermissionService();
      resolve(permissionService);
    });
  }

  public can(requiredAccess: string | Array<string>, allowOverride = true): boolean {
    const currentUserRoles =
      allowOverride && PermissionService._roleOverride
        ? [PermissionService._roleOverride]
        : useAuthStore().getClientRoles;

    const requiredPerms = Array.isArray(requiredAccess) ? requiredAccess : [requiredAccess];

    const perms = PermissionMap.filter((p) => currentUserRoles?.includes(p.role)).flatMap((p) => p.permissions);

    return currentUserRoles?.includes(AccessRole.PCNS_DEVELOPER) || !!perms.some((p) => requiredPerms?.includes(p));
  }

  public async requestBasicAccess() {
    return appAxios().post('sso/requestBasicAccess');
  }

  public async searchIdirUsers(params?: any) {
    return appAxios().get('sso/idir/users', { params: params });
  }

  public async searchBasicBceidUsers(params?: any) {
    return appAxios().get('sso/basic-bceid/users', { params: params });
  }

  public async getRoles() {
    return appAxios().get('sso/roles');
  }

  public setRoleOverride(role: string | undefined) {
    PermissionService._roleOverride = role;
  }

  public getRoleOverride() {
    return PermissionService._roleOverride;
  }
}
