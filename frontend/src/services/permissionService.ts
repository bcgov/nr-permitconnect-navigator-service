import { appAxios } from './interceptors';

import { useAuthStore } from '@/store';
import { ACCESS_ROLES } from '../utils/enums';

export const enum PERMISSIONS {
  HOUSING_BRINGFORWARD_CREATE = 'permission.housing.bringforward.create',
  HOUSING_BRINGFORWARD_READ = 'permission.housing.bringforward.read',
  HOUSING_BRINGFORWARD_UPDATE = 'permission.housing.bringforward.update',
  HOUSING_BRINGFORWARD_DELETE = 'permission.housing.bringforward.delete',

  HOUSING_ENQUIRY_CREATE = 'permission.housing.enquiry.create',
  HOUSING_ENQUIRY_READ = 'permission.housing.enquiry.read',
  HOUSING_ENQUIRY_UPDATE = 'permission.housing.enquiry.update',
  HOUSING_ENQUIRY_DELETE = 'permission.housing.enquiry.delete',

  HOUSING_SUBMISSION_CREATE = 'permission.housing.submission.create',
  HOUSING_SUBMISSION_READ = 'permission.housing.submission.read',
  HOUSING_SUBMISSION_UPDATE = 'permission.housing.submission.update',
  HOUSING_SUBMISSION_DELETE = 'permission.housing.submission.delete',

  NAVIGATION_HOUSING = 'permission.navigation.housing',
  NAVIGATION_SUBMISSIONS = 'permission.navigation.submissions',
  NAVIGATION_USER_MANAGEMENT = 'permission.navigation.usermanagement',
  NAVIGATION_DEVELOPER = 'permission.navigation.developer',

  TESTING_ROLE_OVERRIDE = 'testing.role.override'
}

const PermissionMap = [
  /* Housing Bring forward */
  {
    name: PERMISSIONS.HOUSING_BRINGFORWARD_CREATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },
  {
    name: PERMISSIONS.HOUSING_BRINGFORWARD_READ,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },
  {
    name: PERMISSIONS.HOUSING_BRINGFORWARD_UPDATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },
  {
    name: PERMISSIONS.HOUSING_BRINGFORWARD_DELETE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },

  /* Housing Enquiry */
  {
    name: PERMISSIONS.HOUSING_ENQUIRY_CREATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.HOUSING_ENQUIRY_READ,
    roles: [
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_PROPONENT,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.HOUSING_ENQUIRY_UPDATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.HOUSING_ENQUIRY_DELETE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },

  /* Housing Submission */
  {
    name: PERMISSIONS.HOUSING_SUBMISSION_CREATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },
  {
    name: PERMISSIONS.HOUSING_SUBMISSION_READ,
    roles: [
      ACCESS_ROLES.PCNS_ADMIN,
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.HOUSING_SUBMISSION_UPDATE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },
  {
    name: PERMISSIONS.HOUSING_SUBMISSION_DELETE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_NAVIGATOR, ACCESS_ROLES.PCNS_SUPERVISOR]
  },

  /* Navigation */
  {
    name: PERMISSIONS.NAVIGATION_HOUSING,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.NAVIGATION_SUBMISSIONS,
    roles: [
      ACCESS_ROLES.PCNS_ADMIN,
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.NAVIGATION_USER_MANAGEMENT,
    roles: [ACCESS_ROLES.PCNS_ADMIN, ACCESS_ROLES.PCNS_DEVELOPER]
  },
  {
    name: PERMISSIONS.NAVIGATION_DEVELOPER,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER]
  },

  /* Testing */
  {
    name: PERMISSIONS.TESTING_ROLE_OVERRIDE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER]
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

  public can(requiredAccess: string, allowOverride = true): boolean {
    const currentUserRoles =
      allowOverride && PermissionService._roleOverride
        ? [PermissionService._roleOverride]
        : useAuthStore().getClientRoles;

    const perm = PermissionMap.find((p) => p.name === requiredAccess);
    return !!perm?.roles.some((r) => currentUserRoles?.includes(r));
  }

  public async requestBasicAccess() {
    return appAxios().post('sso/requestBasicAccess');
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
