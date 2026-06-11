import type { AccessRequest, IdentityProvider, Nullable, PartialFields, User } from '@/types';
import type { Action, GroupName, Initiative, Resource } from '@/utils/enums/application';

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
  accessRequest?: PartialFields<AccessRequest, 'accessRequestId'>;
  user: User;
}
