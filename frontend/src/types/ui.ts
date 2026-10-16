import type { AccessRequest, Nullable, User } from '@/types';
import type { Action, GroupName, IdentityProviderKind, Initiative, Resource } from '@/utils/enums/application';

export interface Code {
  code: string;
  display: string;
  definition?: string;
  active: boolean;
}

export interface Config {
  // Additional data passed from backend
  features: Record<string, boolean>;
  gitRev: string;
  idpList: IdentityProvider[];

  // Frontend config object
  apiPath?: string;
  ches: {
    roadmap: {
      bcc?: string;
    };
    submission: {
      cc?: string;
    };
  };
  coms: {
    apiPath?: string;
    bucketId?: string;
  };
  geocoder: {
    apiPath?: string;
  };
  notificationBanner?: string;
  oidc: {
    authority?: string;
    clientId?: string;
  };
  openStreetMap: {
    apiPath?: string;
  };
  orgbook: {
    apiPath?: string;
  };
}

// Entries of the IdP config list served by /config, not rows of the identity_provider table
export interface IdentityProvider {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
}

export interface InputEvent extends Event {
  target: HTMLInputElement;
}

export interface DateTimeStrings {
  date: Nullable<string>;
  time: Nullable<string>;
}

export interface Pagination {
  rows?: number;
  order?: number;
  field?: string;
  page?: number;
}

export interface Permission {
  group: GroupName;
  initiative: Initiative;
  resource: Resource;
  action: Action;
}

export interface UserAccessRequest {
  // Requests created in the table only have these fields until the list is reloaded
  accessRequest?: Pick<AccessRequest, 'userId' | 'grant' | 'groupId' | 'status'> & Partial<AccessRequest>;
  // Table status derived from the user's access requests
  user: User & { status?: string };
}
