import type { IdentityProvider } from './IdentityProvider';

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
