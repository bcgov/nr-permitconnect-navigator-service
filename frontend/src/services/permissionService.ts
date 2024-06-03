import { appAxios } from './interceptors';

import { useAuthStore } from '@/store';
import { ACCESS_ROLES } from '../utils/enums';
import AuthService from './authService';

export const enum PERMISSIONS {
  HOUSING_BRINGFORWARD_READ = 'permission.housing.bringforward.read',

  HOUSING_ENQUIRY_CREATE = 'permission.housing.enquiry.create',
  HOUSING_ENQUIRY_READ = 'permission.housing.enquiry.read',
  HOUSING_ENQUIRY_UPDATE = 'permission.housing.enquiry.update',
  HOUSING_ENQUIRY_DELETE = 'permission.housing.enquiry.delete',

  // HOUSING_INTAKE

  // HOUSING_FILES

  // HOUSING_NOTE

  // HOUSING_PERMIT

  // HOUSING_ROADMAP

  HOUSING_SUBMISSION_CREATE = 'permission.housing.submission.create',
  HOUSING_SUBMISSION_READ = 'permission.housing.submission.read',
  HOUSING_SUBMISSION_UPDATE = 'permission.housing.submission.update',
  HOUSING_SUBMISSION_DELETE = 'permission.housing.submission.delete',

  HOUSING_SUBMISSIONS_NAVIGATOR_READ = 'permission.housing.submissions.navigator.read',
  HOUSING_SUBMISSIONS_PROPONENT_READ = 'permission.housing.submissions.proponent.read',

  /* Navbar and router navigation permissions */
  NAVIGATION_HOUSING = 'permission.navigation.housing',
  NAVIGATION_HOUSING_ENQUIRY = 'permission.navigation.housing.enquiry',
  NAVIGATION_HOUSING_INTAKE = 'permission.navigation.housing.intake',
  NAVIGATION_HOUSING_SUBMISSION = 'permission.navigation.housing.submission',
  NAVIGATION_HOUSING_SUBMISSIONS = 'permission.navigation.housing.submissions',
  NAVIGATION_HOUSING_SUBMISSIONS_SUB = 'permission.navigation.housing.submissions.sub',
  NAVIGATION_USER_MANAGEMENT = 'permission.navigation.usermanagement',
  NAVIGATION_DEVELOPER = 'permission.navigation.developer',

  /* Testing specific permissions */
  TESTING_ROLE_OVERRIDE = 'testing.role.override'
}

const PermissionMap = [
  /* Housing Bring forward */
  {
    name: PERMISSIONS.HOUSING_BRINGFORWARD_READ,
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

  /* Housing Submissions */
  {
    name: PERMISSIONS.HOUSING_SUBMISSIONS_NAVIGATOR_READ,
    roles: [
      ACCESS_ROLES.PCNS_ADMIN,
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.HOUSING_SUBMISSIONS_PROPONENT_READ,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },

  /* Navigation */
  {
    name: PERMISSIONS.NAVIGATION_HOUSING,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.NAVIGATION_HOUSING_INTAKE,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.NAVIGATION_HOUSING_ENQUIRY,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.NAVIGATION_HOUSING_SUBMISSION,
    roles: [
      ACCESS_ROLES.PCNS_ADMIN,
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_PROPONENT,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.NAVIGATION_HOUSING_SUBMISSIONS,
    roles: [
      ACCESS_ROLES.PCNS_ADMIN,
      ACCESS_ROLES.PCNS_DEVELOPER,
      ACCESS_ROLES.PCNS_NAVIGATOR,
      ACCESS_ROLES.PCNS_SUPERVISOR
    ]
  },
  {
    name: PERMISSIONS.NAVIGATION_HOUSING_SUBMISSIONS_SUB,
    roles: [ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_PROPONENT]
  },
  {
    name: PERMISSIONS.NAVIGATION_USER_MANAGEMENT,
    roles: [ACCESS_ROLES.PCNS_ADMIN, ACCESS_ROLES.PCNS_DEVELOPER, ACCESS_ROLES.PCNS_SUPERVISOR]
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

  public can(requiredAccess: string | Array<string>, allowOverride = true): boolean {
    const currentUserRoles =
      allowOverride && PermissionService._roleOverride
        ? [PermissionService._roleOverride]
        : useAuthStore().getClientRoles;

    const requiredPerms = Array.isArray(requiredAccess) ? requiredAccess : [requiredAccess];

    const perms = PermissionMap.filter((p) => requiredPerms.includes(p.name));
    return !!perms.some((p) => p.roles.some((r) => currentUserRoles?.includes(r)));
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
