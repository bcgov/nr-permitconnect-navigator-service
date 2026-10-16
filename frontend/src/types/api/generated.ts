/**
 * AUTO-GENERATED FILE - DO NOT EDIT
 * @see app/src/docs/generateTypes.ts
 *
 * To update this file after changing a route or its zod schemas, run:
 * `npm run docs:types`
 */

// openapi-typescript emits `{ [name: string]: unknown }` for response headers
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

export interface paths {
  '/activity/{activityId}/contact': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** List activity_contact linkages for an activity */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of activity contact linkages */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ActivityContact'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/activity/{activityId}/contact/{contactId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /** Update an activity_contact linkage for an activity */
    put: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
          contactId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            /** @enum {string} */
            role: 'ADMIN' | 'MEMBER' | 'PRIMARY';
          };
        };
      };
      responses: {
        /** @description The updated (and possibly demoted) activity contact linkages */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['UpdateActivityContactResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    /** Create an activity_contact linkage for an activity */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
          contactId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            /** @enum {string} */
            role: 'ADMIN' | 'MEMBER' | 'PRIMARY';
          };
        };
      };
      responses: {
        /** @description The created activity contact linkage */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ActivityContact'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    /** Delete an activity_contact linkage for an activity */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
          contactId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The activity contact linkage was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/contact': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get current user's contact information */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The current user's contact */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Contact'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Create or update a contact */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            userId?: string | null;
            contactId?: string | null;
            email: string;
            firstName: string;
            lastName?: string | null;
            phoneNumber: string;
            /** @enum {string} */
            contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
            /** @enum {string} */
            contactPreference: 'Phone call' | 'Email' | 'Either';
          };
        };
      };
      responses: {
        /** @description The created or updated contact */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Contact'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/contact/match': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Match contacts */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            contactId?: string[] | null;
            userId?: string[] | null;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            phoneNumber?: string | null;
          };
        };
      };
      responses: {
        /** @description Contacts matching the given search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Contact'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/contact/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search contacts */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            userId?: string[] | null;
            contactId?: string[] | null;
            email?: string | null;
            firstName?: string | null;
            lastName?: string | null;
            phoneNumber?: string | null;
            /** @enum {string|null} */
            contactApplicantRelationship?: 'Property owner' | 'Project consultant' | 'Other' | null;
            /** @enum {string|null} */
            contactPreference?: 'Phone call' | 'Email' | 'Either' | null;
            /** @default false */
            hasActivity?: boolean;
            /** @enum {string|null} */
            initiative?: 'PCNS' | 'ELECTRIFICATION' | 'GENERAL' | 'HOUSING' | null;
            /** @default false */
            includeActivities?: boolean;
          };
        };
      };
      responses: {
        /** @description Contacts matching the given search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Contact'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/contact/{contactId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a specific contact */
    get: {
      parameters: {
        query?: {
          includeActivities?: boolean;
        };
        header?: never;
        path: {
          contactId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested contact */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Contact'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Delete a specific contact */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          contactId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The contact was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of electrification projects */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of electrification projects */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProject'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates a blank electrification project */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': Record<string, never>;
        };
      };
      responses: {
        /** @description The created electrification project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/activityIds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of all the activityIds */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of activity IDs */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string[];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search electrification projects */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            dateRange?: string[] | null;
            includeUser?: boolean;
            electrificationProjectId?: string[];
            applicationStatus?: string[];
            searchTag?: string;
            projectType?: string[];
            projectCategory?: string[];
            /** @default 0 */
            skip?: number | null;
            sortField?: string | null;
            /** @enum {string|null} */
            sortOrder?: '0' | '1' | '-1' | null;
            /** @default 10 */
            take?: number;
          };
        };
      };
      responses: {
        /** @description A list of electrification projects matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchElectrificationProjectsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/statistics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets electrification project statistics */
    get: {
      parameters: {
        query?: {
          dateFrom?: string | null;
          dateTo?: string | null;
          monthYear?: string | null;
          userId?: string | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Electrification project statistics */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProjectStatistics'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/draft/{draftId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a electrification project draft */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Hard deletes a electrification project draft */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The draft was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of electrification project drafts */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of electrification project drafts */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates or updates an intake and set status to Draft */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            draftId?: string | null;
            data: unknown;
          };
        };
      };
      responses: {
        /** @description The updated electrification project draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description The created electrification project draft */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/draft/submit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Creates or updates an intake and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string | null;
            basic: {
              projectDescription?: string | null;
              projectName: string;
              registeredId?: string | null;
              registeredName: string;
            };
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            draftId?: string | null;
            project: {
              bcHydroNumber?: string | null;
              projectType: string;
            };
          };
        };
      };
      responses: {
        /** @description The submitted electrification project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/project/{electrificationProjectId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific electrification project */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          electrificationProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested electrification project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes an electrification project */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          electrificationProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The electrification project was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches a electrification project */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          electrificationProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            projectName?: string;
            companyNameRegistered?: string | null;
            companyIdRegistered?: string | null;
            projectType?: string;
            bcHydroNumber?: string | null;
            projectDescription?: string | null;
            projectCategory?: string | null;
            assignedUserId?: string | null;
            /** @enum {string|null} */
            hasEpa?: 'Yes' | 'No' | null;
            megawatts?: number | null;
            /** @enum {string|null} */
            bcEnvironmentAssessNeeded?: 'Yes' | 'No' | null;
            locationDescription?: string | null;
            astNotes?: string | null;
            queuePriority?: number;
            /** @enum {string} */
            submissionType?: 'Guidance' | 'Inapplicable';
            /** @enum {string} */
            applicationStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
            addedToAts?: boolean;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
            aaiUpdated?: boolean;
          };
        };
      };
      responses: {
        /** @description The updated electrification project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ElectrificationProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/electrification/access-request': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get access requests */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of access requests */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Request to create/revoke a user and access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            user: {
              userId?: string | null;
              idp: string;
              sub: string;
              email: string;
              firstName: string;
              fullName: string;
              lastName: string;
              bceidBusinessName?: string | null;
              active?: boolean;
            };
            accessRequest: {
              accessRequestId?: string | null;
              userId?: string | null;
              grant: boolean;
              groupId?: number | null;
              status?: string | null;
              update?: boolean | null;
            };
          };
        };
      };
      responses: {
        /** @description The access request was actioned immediately (caller is an admin, grant) */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              userId: string;
              grant: boolean;
              groupId?: number | null;
              /** @enum {string} */
              status: 'Approved' | 'Pending' | 'Rejected';
            };
          };
        };
        /** @description The created access request, pending approval */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'];
          };
        };
        /** @description The access request was revoked immediately (caller is an admin, revoke) */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/access-request/{accessRequestId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Process an access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          accessRequestId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            approve: boolean;
          };
        };
      };
      responses: {
        /** @description The access request was processed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/document': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a document */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            documentId: string;
            filename: string;
            mimeType?: string;
            filesize: number;
          };
        };
      };
      responses: {
        /** @description The created document */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/document/{documentId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a document */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          documentId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The document was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/document/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of documents */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of documents for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/enquiry/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets enquiries related to an activityId */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries related to the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/enquiry/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search all enquiries */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            enquiryId?: string[];
            includeUser?: boolean;
          };
        };
      };
      responses: {
        /** @description A list of enquiries matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/enquiry/{enquiryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific enquiry */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes an enquiry */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The enquiry was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches an enquiry */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            submissionType?: string | null;
            relatedActivityId?: string | null;
            enquiryDescription?: string | null;
            assignedUserId?: string | null;
            /** @enum {string} */
            enquiryStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
            /** @enum {string} */
            submittedMethod?: 'Email' | 'PCNS' | 'Phone';
            addedToAts?: boolean;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
          };
        };
      };
      responses: {
        /** @description The updated enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/electrification/enquiry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of enquiries */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates an enquiry and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            enquiryDescription?: string | null;
            relatedActivityId?: string | null;
            /** @enum {string|null} */
            submissionType?: 'Assistance' | 'General enquiry' | 'Status request' | 'Escalation' | 'Inapplicable' | null;
          };
        };
      };
      responses: {
        /** @description The created enquiry */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateEnquiryResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a note history */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note: string;
            shownToProponent?: boolean;
            title: string;
            type: string;
          };
        };
      };
      responses: {
        /** @description The created note history */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/note/{noteHistoryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a note history */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The note history was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patch a note history */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note?: string | null;
            /** @enum {string} */
            resource: 'ELECTRIFICATION_PROJECT' | 'ENQUIRY' | 'GENERAL_PROJECT' | 'HOUSING_PROJECT';
            shownToProponent?: boolean;
            title?: string;
            type?: string;
          };
        };
      };
      responses: {
        /** @description The updated note history */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/electrification/note/bring-forward': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of bring forward note histories */
    get: {
      parameters: {
        query?: {
          bringForwardState?: 'Unresolved' | 'Resolved';
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of bring forward note histories */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BringForward'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/note/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of note histories */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of note histories for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits */
    get: {
      parameters: {
        query?: {
          activityId?: string | null;
          includeNotes?: boolean | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of permits */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Create or update a permit */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitType?: {
              permitTypeId: number;
              agency: string;
              division?: string | null;
              branch?: string | null;
              businessDomain?: string | null;
              type: string;
              family?: string | null;
              name: string;
              nameSubtype?: string | null;
              acronym?: string | null;
              infoUrl?: string | null;
              trackedInAts: boolean;
              sourceSystem?: string | null;
            };
            permitId?: string | null;
            permitTypeId: number;
            activityId?: string;
            issuedPermitId?: string | null;
            permitNote?:
              | ({
                  permitId?: string | null;
                  permitNoteId?: string | null;
                  note: string;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                } | null)[]
              | null;
            permitTracking?:
              | {
                  trackingId?: string | null;
                  permitTrackingId?: number | null;
                  shownToProponent?: boolean | null;
                  sourceSystemKindId?: number | null;
                  sourceSystemKind?: {
                    sourceSystemKindId: number;
                    description: string;
                    integrated?: boolean;
                    kind?: string | null;
                    sourceSystem: string;
                    createdAt?: string | number | unknown;
                    createdBy?: string | null;
                    updatedAt?: string | number | unknown;
                    updatedBy?: string | null;
                    deletedAt?: string | number | unknown;
                    deletedBy?: string | null;
                  } | null;
                  permitId?: string | null;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                }[]
              | null;
            needed: string;
            state: string;
            stage: string;
            onHoldCode?: string | null;
            /** Format: date */
            submittedDate?: string | null;
            submittedTime?: string | null;
            /** Format: date */
            consultationStartDate?: string | null;
            consultationStartTime?: string | null;
            /** Format: date */
            consultationEndDate?: string | null;
            consultationEndTime?: string | null;
            /** Format: date */
            decisionDate?: string | null;
            decisionTime?: string | null;
            /** Format: date */
            statusLastChanged?: string | null;
            statusLastChangedTime?: string | null;
            /** Format: date */
            statusLastVerified?: string | null;
            statusLastVerifiedTime?: string | null;
            /** Format: date-time */
            targetDate?: string | null;
            targetDateDescription?: string | null;
            technicalReviewer?: string | null;
            createdAt?: string | number | unknown;
            createdBy?: string | null;
            updatedAt?: string | number | unknown;
            updatedBy?: string | null;
            deletedAt?: string | number | unknown;
            deletedBy?: string | null;
          };
        };
      };
      responses: {
        /** @description The created or updated permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/permit/{permitId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a permit */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Delete a permit */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The permit was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/permit/intake': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create multiple permit records */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitTypeId: number;
            activityId: string;
            trackingId?: string | null;
            submittedDate?: string | number | unknown;
          }[];
        };
      };
      responses: {
        /** @description The created permits */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/permit/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits based on search criteria */
    get: {
      parameters: {
        query?: {
          dateRange?: string[] | null;
          permitTypeId?: string | null;
          searchTag?: string | null;
          sourceSystemKindId?: string | null;
          skip?: number | null;
          sortField?: string | null;
          sortOrder?: '0' | '1' | '-1' | null;
          take?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Paginated permits matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchPermitsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/roadmap': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send an email with the roadmap data */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            selectedFileIds?: string[];
            emailData: {
              bcc?: string[];
              bodyType: string;
              body: string;
              cc?: string[];
              delayTS?: number;
              from: string;
              priority?: string;
              subject: string;
              tag?: string;
              to: string[];
            };
          };
        };
      };
      responses: {
        /** @description The note history created for the sent roadmap */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/electrification/roadmap/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the roadmap note for a project */
    get: {
      parameters: {
        query: {
          activityId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The generated roadmap note text */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of general projects */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of general projects */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProject'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates a blank general project */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': Record<string, never>;
        };
      };
      responses: {
        /** @description The created general project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/activityIds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of all the activityIds */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of activity IDs */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string[];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search general projects */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            dateRange?: string[] | null;
            includeUser?: boolean;
            generalProjectId?: string[];
            applicationStatus?: string[];
            searchTag?: string;
            submissionType?: ('Guidance' | 'Inapplicable')[];
            /** @default 0 */
            skip?: number | null;
            sortField?: string | null;
            /** @enum {string|null} */
            sortOrder?: '0' | '1' | '-1' | null;
            /** @default 10 */
            take?: number;
          };
        };
      };
      responses: {
        /** @description A list of general projects matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchGeneralProjectsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/statistics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets general project statistics */
    get: {
      parameters: {
        query?: {
          dateFrom?: string | null;
          dateTo?: string | null;
          monthYear?: string | null;
          userId?: string | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description General project statistics */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProjectStatistics'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/draft/{draftId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a specific general project draft */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Hard deletes a general project draft */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The draft was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of general project drafts */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of general project drafts */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates or updates an intake and set status to Draft */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            draftId?: string | null;
            data: unknown;
          };
        };
      };
      responses: {
        /** @description The updated general project draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description The created general project draft */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/draft/submit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Creates or updates an intake and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            draftId?: string | null;
            activityId?: string | null;
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            basic: {
              /** @enum {string} */
              projectApplicantType: 'Business' | 'Individual';
              projectName: string;
              projectNumber?: string;
              projectDescription: string;
              registeredId?: string | null;
              registeredName?: string | null;
            };
            location: {
              /** @enum {string} */
              naturalDisaster: 'Yes' | 'No';
              /** @enum {string} */
              projectLocation: 'Location coordinates' | 'Street address' | 'Pin or draw your location';
              streetAddress?: string | null;
              locality?: string | null;
              province?: string | null;
              latitude?: number | null;
              longitude?: number | null;
              ltsaPidLookup?: string | null;
              geomarkUrl?: string | null;
              geoJson?: unknown;
              projectLocationDescription?: string | null;
            };
            permits: {
              appliedPermits?:
                | {
                    permitTypeId: number;
                    stage?: string | null;
                    submittedDate?: string | number | unknown;
                    permitTracking?:
                      | {
                          trackingId?: string | null;
                          permitTrackingId?: number | null;
                          shownToProponent?: boolean | null;
                          sourceSystemKindId?: number | null;
                          sourceSystemKind?: {
                            sourceSystemKindId: number;
                            description: string;
                            integrated?: boolean;
                            kind?: string | null;
                            sourceSystem: string;
                            createdAt?: string | number | unknown;
                            createdBy?: string | null;
                            updatedAt?: string | number | unknown;
                            updatedBy?: string | null;
                            deletedAt?: string | number | unknown;
                            deletedBy?: string | null;
                          } | null;
                          permitId?: string | null;
                          createdAt?: string | number | unknown;
                          createdBy?: string | null;
                          updatedAt?: string | number | unknown;
                          updatedBy?: string | null;
                          deletedAt?: string | number | unknown;
                          deletedBy?: string | null;
                        }[]
                      | null;
                  }[]
                | null;
              /** @enum {string} */
              hasAppliedProvincialPermits: 'Yes' | 'No' | 'Unsure';
              investigatePermits?:
                | {
                    permitTypeId: number;
                  }[]
                | null;
            };
          };
        };
      };
      responses: {
        /** @description The submitted general project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/project/{generalProjectId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific general project */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          generalProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested general project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes a general project */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          generalProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The general project was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches a general project */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          generalProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            queuePriority?: number;
            /** @enum {string} */
            submissionType?: 'Guidance' | 'Inapplicable';
            companyNameRegistered?: string | null;
            companyIdRegistered?: string | null;
            projectName?: string;
            activityType?: string;
            projectDescription?: string | null;
            streetAddress?: string | null;
            locality?: string | null;
            province?: string | null;
            locationPids?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            geomarkUrl?: string | null;
            geoJson?: unknown;
            naturalDisaster?: boolean;
            projectLocationDescription?: string | null;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
            aaiUpdated?: boolean;
            astNotes?: string | null;
            assignedUserId?: string | null;
            /** @enum {string} */
            applicationStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
            region?: string | null;
            area?: string | null;
            businessArea?: string | null;
          };
        };
      };
      responses: {
        /** @description The updated general project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['GeneralProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/general/access-request': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get access requests */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of access requests */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Request to create/revoke a user and access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            user: {
              userId?: string | null;
              idp: string;
              sub: string;
              email: string;
              firstName: string;
              fullName: string;
              lastName: string;
              bceidBusinessName?: string | null;
              active?: boolean;
            };
            accessRequest: {
              accessRequestId?: string | null;
              userId?: string | null;
              grant: boolean;
              groupId?: number | null;
              status?: string | null;
              update?: boolean | null;
            };
          };
        };
      };
      responses: {
        /** @description The access request was actioned immediately (caller is an admin, grant) */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              userId: string;
              grant: boolean;
              groupId?: number | null;
              /** @enum {string} */
              status: 'Approved' | 'Pending' | 'Rejected';
            };
          };
        };
        /** @description The created access request, pending approval */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'];
          };
        };
        /** @description The access request was revoked immediately (caller is an admin, revoke) */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/access-request/{accessRequestId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Process an access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          accessRequestId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            approve: boolean;
          };
        };
      };
      responses: {
        /** @description The access request was processed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/document': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a document */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            documentId: string;
            filename: string;
            mimeType?: string;
            filesize: number;
          };
        };
      };
      responses: {
        /** @description The created document */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/document/{documentId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a document */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          documentId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The document was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/document/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of documents */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of documents for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/enquiry/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets enquiries related to an activityId */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries related to the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/enquiry/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search all enquiries */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            enquiryId?: string[];
            includeUser?: boolean;
          };
        };
      };
      responses: {
        /** @description A list of enquiries matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/enquiry/{enquiryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific enquiry */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes an enquiry */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The enquiry was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches an enquiry */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            submissionType?: string | null;
            relatedActivityId?: string | null;
            enquiryDescription?: string | null;
            assignedUserId?: string | null;
            /** @enum {string} */
            enquiryStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
            /** @enum {string} */
            submittedMethod?: 'Email' | 'PCNS' | 'Phone';
            addedToAts?: boolean;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
          };
        };
      };
      responses: {
        /** @description The updated enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/general/enquiry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of enquiries */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates an enquiry and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            enquiryDescription?: string | null;
            relatedActivityId?: string | null;
            /** @enum {string|null} */
            submissionType?: 'Assistance' | 'General enquiry' | 'Status request' | 'Escalation' | 'Inapplicable' | null;
          };
        };
      };
      responses: {
        /** @description The created enquiry */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateEnquiryResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/map/pids/{projectId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get PIDs for a project */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          projectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The PIDs for the project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
        /** @description No PIDs found for the project */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a note history */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note: string;
            shownToProponent?: boolean;
            title: string;
            type: string;
          };
        };
      };
      responses: {
        /** @description The created note history */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/note/{noteHistoryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a note history */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The note history was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patch a note history */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note?: string | null;
            /** @enum {string} */
            resource: 'ELECTRIFICATION_PROJECT' | 'ENQUIRY' | 'GENERAL_PROJECT' | 'HOUSING_PROJECT';
            shownToProponent?: boolean;
            title?: string;
            type?: string;
          };
        };
      };
      responses: {
        /** @description The updated note history */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/general/note/bring-forward': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of bring forward note histories */
    get: {
      parameters: {
        query?: {
          bringForwardState?: 'Unresolved' | 'Resolved';
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of bring forward note histories */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BringForward'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/note/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of note histories */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of note histories for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits */
    get: {
      parameters: {
        query?: {
          activityId?: string | null;
          includeNotes?: boolean | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of permits */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Create or update a permit */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitType?: {
              permitTypeId: number;
              agency: string;
              division?: string | null;
              branch?: string | null;
              businessDomain?: string | null;
              type: string;
              family?: string | null;
              name: string;
              nameSubtype?: string | null;
              acronym?: string | null;
              infoUrl?: string | null;
              trackedInAts: boolean;
              sourceSystem?: string | null;
            };
            permitId?: string | null;
            permitTypeId: number;
            activityId?: string;
            issuedPermitId?: string | null;
            permitNote?:
              | ({
                  permitId?: string | null;
                  permitNoteId?: string | null;
                  note: string;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                } | null)[]
              | null;
            permitTracking?:
              | {
                  trackingId?: string | null;
                  permitTrackingId?: number | null;
                  shownToProponent?: boolean | null;
                  sourceSystemKindId?: number | null;
                  sourceSystemKind?: {
                    sourceSystemKindId: number;
                    description: string;
                    integrated?: boolean;
                    kind?: string | null;
                    sourceSystem: string;
                    createdAt?: string | number | unknown;
                    createdBy?: string | null;
                    updatedAt?: string | number | unknown;
                    updatedBy?: string | null;
                    deletedAt?: string | number | unknown;
                    deletedBy?: string | null;
                  } | null;
                  permitId?: string | null;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                }[]
              | null;
            needed: string;
            state: string;
            stage: string;
            onHoldCode?: string | null;
            /** Format: date */
            submittedDate?: string | null;
            submittedTime?: string | null;
            /** Format: date */
            consultationStartDate?: string | null;
            consultationStartTime?: string | null;
            /** Format: date */
            consultationEndDate?: string | null;
            consultationEndTime?: string | null;
            /** Format: date */
            decisionDate?: string | null;
            decisionTime?: string | null;
            /** Format: date */
            statusLastChanged?: string | null;
            statusLastChangedTime?: string | null;
            /** Format: date */
            statusLastVerified?: string | null;
            statusLastVerifiedTime?: string | null;
            /** Format: date-time */
            targetDate?: string | null;
            targetDateDescription?: string | null;
            technicalReviewer?: string | null;
            createdAt?: string | number | unknown;
            createdBy?: string | null;
            updatedAt?: string | number | unknown;
            updatedBy?: string | null;
            deletedAt?: string | number | unknown;
            deletedBy?: string | null;
          };
        };
      };
      responses: {
        /** @description The created or updated permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/permit/{permitId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a permit */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Delete a permit */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The permit was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/permit/intake': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create multiple permit records */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitTypeId: number;
            activityId: string;
            trackingId?: string | null;
            submittedDate?: string | number | unknown;
          }[];
        };
      };
      responses: {
        /** @description The created permits */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/permit/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits based on search criteria */
    get: {
      parameters: {
        query?: {
          dateRange?: string[] | null;
          permitTypeId?: string | null;
          searchTag?: string | null;
          sourceSystemKindId?: string | null;
          skip?: number | null;
          sortField?: string | null;
          sortOrder?: '0' | '1' | '-1' | null;
          take?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Paginated permits matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchPermitsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/roadmap': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send an email with the roadmap data */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            selectedFileIds?: string[];
            emailData: {
              bcc?: string[];
              bodyType: string;
              body: string;
              cc?: string[];
              delayTS?: number;
              from: string;
              priority?: string;
              subject: string;
              tag?: string;
              to: string[];
            };
          };
        };
      };
      responses: {
        /** @description The note history created for the sent roadmap */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/general/roadmap/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the roadmap note for a project */
    get: {
      parameters: {
        query: {
          activityId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The generated roadmap note text */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of housing projects */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of housing projects */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProject'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates a blank housing project */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': Record<string, never>;
        };
      };
      responses: {
        /** @description The created housing project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/activityIds': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of all the activityIds */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of activity IDs */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string[];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search housing projects */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            dateRange?: string[] | null;
            includeUser?: boolean;
            housingProjectId?: string[];
            applicationStatus?: string[];
            searchTag?: string;
            submissionType?: ('Guidance' | 'Inapplicable')[];
            /** @default 0 */
            skip?: number | null;
            sortField?: string | null;
            /** @enum {string|null} */
            sortOrder?: '0' | '1' | '-1' | null;
            /** @default 10 */
            take?: number;
          };
        };
      };
      responses: {
        /** @description Housing projects matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchHousingProjectsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/statistics': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets housing project statistics */
    get: {
      parameters: {
        query?: {
          dateFrom?: string | null;
          dateTo?: string | null;
          monthYear?: string | null;
          userId?: string | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Housing project statistics */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProjectStatistics'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/draft/{draftId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a specific housing project draft */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A housing project draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Hard deletes a housing project draft */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          draftId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The draft was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/draft': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of housing project drafts */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of housing project drafts */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates or updates an intake and set status to Draft */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            draftId?: string | null;
            data: unknown;
          };
        };
      };
      responses: {
        /** @description The updated housing project draft */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description The created housing project draft */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Draft'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/draft/submit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Creates or updates an intake and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            draftId?: string | null;
            activityId?: string | null;
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            basic: {
              consentToFeedback: boolean;
              /** @enum {string} */
              projectApplicantType: 'Business' | 'Individual';
              projectName: string;
              projectDescription: string;
              registeredId?: string | null;
              registeredName?: string | null;
            };
            housing: {
              /** @enum {string} */
              financiallySupportedBc: 'Yes' | 'No' | 'Unsure';
              /** @enum {string} */
              financiallySupportedIndigenous: 'Yes' | 'No' | 'Unsure';
              /** @enum {string} */
              financiallySupportedNonProfit: 'Yes' | 'No' | 'Unsure';
              /** @enum {string} */
              financiallySupportedHousingCoop: 'Yes' | 'No' | 'Unsure';
              /** @enum {string} */
              hasRentalUnits: 'Yes' | 'No' | 'Unsure';
              housingCoopDescription?: string;
              indigenousDescription?: string;
              multiFamilySelected?: boolean | null;
              /** @enum {string} */
              multiFamilyUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure';
              nonProfitDescription?: string;
              otherSelected?: boolean | null;
              /** @enum {string} */
              otherUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure';
              otherUnitsDescription?: string;
              /** @enum {string} */
              rentalUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure';
              singleFamilySelected?: boolean | null;
              /** @enum {string} */
              singleFamilyUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure';
            };
            location: {
              /** @enum {string} */
              naturalDisaster: 'Yes' | 'No';
              /** @enum {string} */
              projectLocation: 'Location coordinates' | 'Street address' | 'Pin or draw your location';
              streetAddress?: string | null;
              locality?: string | null;
              province?: string | null;
              latitude?: number | null;
              longitude?: number | null;
              ltsaPidLookup?: string | null;
              geomarkUrl?: string | null;
              geoJson?: unknown;
              projectLocationDescription?: string | null;
            };
            permits: {
              appliedPermits?:
                | {
                    permitTypeId: number;
                    stage?: string | null;
                    submittedDate?: string | number | unknown;
                    permitTracking?:
                      | {
                          trackingId?: string | null;
                          permitTrackingId?: number | null;
                          shownToProponent?: boolean | null;
                          sourceSystemKindId?: number | null;
                          sourceSystemKind?: {
                            sourceSystemKindId: number;
                            description: string;
                            integrated?: boolean;
                            kind?: string | null;
                            sourceSystem: string;
                            createdAt?: string | number | unknown;
                            createdBy?: string | null;
                            updatedAt?: string | number | unknown;
                            updatedBy?: string | null;
                            deletedAt?: string | number | unknown;
                            deletedBy?: string | null;
                          } | null;
                          permitId?: string | null;
                          createdAt?: string | number | unknown;
                          createdBy?: string | null;
                          updatedAt?: string | number | unknown;
                          updatedBy?: string | null;
                          deletedAt?: string | number | unknown;
                          deletedBy?: string | null;
                        }[]
                      | null;
                  }[]
                | null;
              /** @enum {string} */
              hasAppliedProvincialPermits: 'Yes' | 'No' | 'Unsure';
              investigatePermits?:
                | {
                    permitTypeId: number;
                  }[]
                | null;
            };
          };
        };
      };
      responses: {
        /** @description The submitted housing project */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/project/{housingProjectId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific housing project */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          housingProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A housing project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes a housing project */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          housingProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The housing project was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches a housing project */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          housingProjectId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            consentToFeedback?: boolean;
            financiallySupported?: boolean;
            queuePriority?: number;
            /** @enum {string} */
            submissionType?: 'Guidance' | 'Inapplicable';
            companyNameRegistered?: string | null;
            companyIdRegistered?: string | null;
            projectName?: string;
            projectDescription?: string | null;
            /** @enum {string|null} */
            singleFamilyUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure' | null;
            /** @enum {string|null} */
            multiFamilyUnits?: '1-9' | '10-49' | '50-500' | '>500' | 'Unsure' | null;
            otherUnitsDescription?: string | null;
            otherUnits?: string | null;
            /** @enum {string} */
            hasRentalUnits?: 'Yes' | 'No' | 'Unsure';
            rentalUnits?: string | null;
            /** @enum {string} */
            financiallySupportedBc?: 'Yes' | 'No' | 'Unsure';
            /** @enum {string} */
            financiallySupportedIndigenous?: 'Yes' | 'No' | 'Unsure';
            indigenousDescription?: string | null;
            /** @enum {string} */
            financiallySupportedNonProfit?: 'Yes' | 'No' | 'Unsure';
            nonProfitDescription?: string | null;
            /** @enum {string} */
            financiallySupportedHousingCoop?: 'Yes' | 'No' | 'Unsure';
            housingCoopDescription?: string | null;
            streetAddress?: string | null;
            locality?: string | null;
            province?: string | null;
            locationPids?: string | null;
            latitude?: number | null;
            longitude?: number | null;
            geomarkUrl?: string | null;
            geoJson?: unknown;
            naturalDisaster?: boolean;
            projectLocationDescription?: string | null;
            addedToAts?: boolean;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
            ltsaCompleted?: boolean;
            bcOnlineCompleted?: boolean;
            aaiUpdated?: boolean;
            astNotes?: string | null;
            assignedUserId?: string | null;
            /** @enum {string} */
            applicationStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
          };
        };
      };
      responses: {
        /** @description The patched housing project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingProject'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/housing/access-request': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get access requests */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of access requests */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Request to create/revoke a user and access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            user: {
              userId?: string | null;
              idp: string;
              sub: string;
              email: string;
              firstName: string;
              fullName: string;
              lastName: string;
              bceidBusinessName?: string | null;
              active?: boolean;
            };
            accessRequest: {
              accessRequestId?: string | null;
              userId?: string | null;
              grant: boolean;
              groupId?: number | null;
              status?: string | null;
              update?: boolean | null;
            };
          };
        };
      };
      responses: {
        /** @description The access request was actioned immediately (caller is an admin, grant) */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': {
              userId: string;
              grant: boolean;
              groupId?: number | null;
              /** @enum {string} */
              status: 'Approved' | 'Pending' | 'Rejected';
            };
          };
        };
        /** @description The created access request, pending approval */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['AccessRequest'];
          };
        };
        /** @description The access request was revoked immediately (caller is an admin, revoke) */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/access-request/{accessRequestId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Process an access request */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          accessRequestId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            approve: boolean;
          };
        };
      };
      responses: {
        /** @description The access request was processed */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/document': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a document */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            documentId: string;
            filename: string;
            mimeType?: string;
            filesize: number;
          };
        };
      };
      responses: {
        /** @description The created document */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/document/{documentId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a document */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          documentId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The document was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/document/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of documents */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of documents for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Document'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/enquiry/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets enquiries related to an activityId */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries related to the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/enquiry/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search all enquiries */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId?: string[];
            createdBy?: string[];
            enquiryId?: string[];
            includeUser?: boolean;
          };
        };
      };
      responses: {
        /** @description A list of enquiries matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/enquiry/{enquiryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a specific enquiry */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Deletes an enquiry */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          enquiryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The enquiry was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patches an enquiry */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            submissionType?: string | null;
            relatedActivityId?: string | null;
            enquiryDescription?: string | null;
            assignedUserId?: string | null;
            /** @enum {string} */
            enquiryStatus?: 'New' | 'In Progress' | 'Delayed' | 'Completed';
            /** @enum {string} */
            submittedMethod?: 'Email' | 'PCNS' | 'Phone';
            addedToAts?: boolean;
            atsClientId?: number | null;
            atsEnquiryId?: number | null;
          };
        };
      };
      responses: {
        /** @description The updated enquiry */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/housing/enquiry': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Gets a list of enquiries */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of enquiries */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Enquiry'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Creates an enquiry and set status to Submitted */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            contact: {
              contactId: string;
              firstName: string;
              lastName?: string | null;
              email: string;
              phoneNumber: string;
              /** @enum {string} */
              contactApplicantRelationship: 'Property owner' | 'Project consultant' | 'Other';
              /** @enum {string} */
              contactPreference: 'Phone call' | 'Email' | 'Either';
            };
            enquiryDescription?: string | null;
            relatedActivityId?: string | null;
            /** @enum {string|null} */
            submissionType?: 'Assistance' | 'General enquiry' | 'Status request' | 'Escalation' | 'Inapplicable' | null;
          };
        };
      };
      responses: {
        /** @description The created enquiry */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['CreateEnquiryResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/map/pids/{projectId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get PIDs for a project */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          projectId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The PIDs for the project */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
        /** @description No PIDs found for the project */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create a note history */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note: string;
            shownToProponent?: boolean;
            title: string;
            type: string;
          };
        };
      };
      responses: {
        /** @description The created note history */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/note/{noteHistoryId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Delete a note history */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The note history was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    /** Patch a note history */
    patch: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          noteHistoryId: string;
        };
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            /** Format: date-time */
            bringForwardDate?: string | null;
            /** @enum {string|null} */
            bringForwardState?: 'Unresolved' | 'Resolved' | null;
            escalateToSupervisor?: boolean;
            escalateToDirector?: boolean;
            escalationType?: string | null;
            note?: string | null;
            /** @enum {string} */
            resource: 'ELECTRIFICATION_PROJECT' | 'ENQUIRY' | 'GENERAL_PROJECT' | 'HOUSING_PROJECT';
            shownToProponent?: boolean;
            title?: string;
            type?: string;
          };
        };
      };
      responses: {
        /** @description The updated note history */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    trace?: never;
  };
  '/housing/note/bring-forward': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of bring forward note histories */
    get: {
      parameters: {
        query?: {
          bringForwardState?: 'Unresolved' | 'Resolved';
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of bring forward note histories */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['BringForward'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/note/list/{activityId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of note histories */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          activityId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of note histories for the activity */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits */
    get: {
      parameters: {
        query?: {
          activityId?: string | null;
          includeNotes?: boolean | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of permits */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    /** Create or update a permit */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitType?: {
              permitTypeId: number;
              agency: string;
              division?: string | null;
              branch?: string | null;
              businessDomain?: string | null;
              type: string;
              family?: string | null;
              name: string;
              nameSubtype?: string | null;
              acronym?: string | null;
              infoUrl?: string | null;
              trackedInAts: boolean;
              sourceSystem?: string | null;
            };
            permitId?: string | null;
            permitTypeId: number;
            activityId?: string;
            issuedPermitId?: string | null;
            permitNote?:
              | ({
                  permitId?: string | null;
                  permitNoteId?: string | null;
                  note: string;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                } | null)[]
              | null;
            permitTracking?:
              | {
                  trackingId?: string | null;
                  permitTrackingId?: number | null;
                  shownToProponent?: boolean | null;
                  sourceSystemKindId?: number | null;
                  sourceSystemKind?: {
                    sourceSystemKindId: number;
                    description: string;
                    integrated?: boolean;
                    kind?: string | null;
                    sourceSystem: string;
                    createdAt?: string | number | unknown;
                    createdBy?: string | null;
                    updatedAt?: string | number | unknown;
                    updatedBy?: string | null;
                    deletedAt?: string | number | unknown;
                    deletedBy?: string | null;
                  } | null;
                  permitId?: string | null;
                  createdAt?: string | number | unknown;
                  createdBy?: string | null;
                  updatedAt?: string | number | unknown;
                  updatedBy?: string | null;
                  deletedAt?: string | number | unknown;
                  deletedBy?: string | null;
                }[]
              | null;
            needed: string;
            state: string;
            stage: string;
            onHoldCode?: string | null;
            /** Format: date */
            submittedDate?: string | null;
            submittedTime?: string | null;
            /** Format: date */
            consultationStartDate?: string | null;
            consultationStartTime?: string | null;
            /** Format: date */
            consultationEndDate?: string | null;
            consultationEndTime?: string | null;
            /** Format: date */
            decisionDate?: string | null;
            decisionTime?: string | null;
            /** Format: date */
            statusLastChanged?: string | null;
            statusLastChangedTime?: string | null;
            /** Format: date */
            statusLastVerified?: string | null;
            statusLastVerifiedTime?: string | null;
            /** Format: date-time */
            targetDate?: string | null;
            targetDateDescription?: string | null;
            technicalReviewer?: string | null;
            createdAt?: string | number | unknown;
            createdBy?: string | null;
            updatedAt?: string | number | unknown;
            updatedBy?: string | null;
            deletedAt?: string | number | unknown;
            deletedBy?: string | null;
          };
        };
      };
      responses: {
        /** @description The created or updated permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/permit/{permitId}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a permit */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The requested permit */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    /** Delete a permit */
    delete: {
      parameters: {
        query?: never;
        header?: never;
        path: {
          permitId: string;
        };
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The permit was deleted */
        204: {
          headers: {
            [name: string]: unknown;
          };
          content?: never;
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/permit/intake': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Create multiple permit records */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            permitTypeId: number;
            activityId: string;
            trackingId?: string | null;
            submittedDate?: string | number | unknown;
          }[];
        };
      };
      responses: {
        /** @description The created permits */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['Permit'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/permit/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permits based on search criteria */
    get: {
      parameters: {
        query?: {
          dateRange?: string[] | null;
          permitTypeId?: string | null;
          searchTag?: string | null;
          sourceSystemKindId?: string | null;
          skip?: number | null;
          sortField?: string | null;
          sortOrder?: '0' | '1' | '-1' | null;
          take?: number;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Paginated permits matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SearchPermitsResponse'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/roadmap': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Send an email with the roadmap data */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            activityId: string;
            selectedFileIds?: string[];
            emailData: {
              bcc?: string[];
              bodyType: string;
              body: string;
              cc?: string[];
              delayTS?: number;
              from: string;
              priority?: string;
              subject: string;
              tag?: string;
              to: string[];
            };
          };
        };
      };
      responses: {
        /** @description The note history created for the sent roadmap */
        201: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['NoteHistory'];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/housing/roadmap/note': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get the roadmap note for a project */
    get: {
      parameters: {
        query: {
          activityId: string;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description The generated roadmap note text */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': string;
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/permit-type': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get a list of permit types */
    get: {
      parameters: {
        query?: {
          initiative?: 'PCNS' | 'ELECTRIFICATION' | 'GENERAL' | 'HOUSING' | null;
        };
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of permit types */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['PermitTypeWithInitiatives'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/reporting/electrification-project/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all electrification project and permit data for csv download */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Electrification project permit report rows */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReportingPermitData'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/reporting/general-project/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all general project and permit data for csv download */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description General project permit report rows */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['ReportingPermitData'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/reporting/housing-project/permit': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all housing project and permit data for csv download */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description Housing project permit report rows */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['HousingReportingPermitData'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/source-system-kind': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Get all source system kind table data */
    get: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: never;
      responses: {
        /** @description A list of source system kinds */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['SourceSystemKind'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/user/search': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Search users */
    post: {
      parameters: {
        query?: never;
        header?: never;
        path?: never;
        cookie?: never;
      };
      requestBody?: {
        content: {
          'application/json': {
            userId?: string[];
            idp?: string[];
            sub?: string;
            email?: string;
            firstName?: string;
            fullName?: string;
            lastName?: string;
            active?: boolean;
            group?: string[];
            includeUserGroups?: boolean;
            initiative?: string[];
          };
        };
      };
      responses: {
        /** @description A list of users matching the search criteria */
        200: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/json': components['schemas']['User'][];
          };
        };
        /** @description Unauthorized */
        401: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Forbidden */
        403: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
        /** @description Validation error */
        422: {
          headers: {
            [name: string]: unknown;
          };
          content: {
            'application/problem+json': components['schemas']['Problem'];
          };
        };
      };
    };
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    ActivityContact: {
      activityId: string;
      contactId: string;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      /** @enum {string} */
      role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
      contact?: {
        contactId: string;
        userId: string | null;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        email: string | null;
        contactPreference: string | null;
        contactApplicantRelationship: string | null;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
      };
    };
    Problem: {
      type: string;
      title: string;
      status: number;
      detail?: string;
      instance?: string;
    };
    UpdateActivityContactResponse: {
      updated: {
        activityId: string;
        contactId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        /** @enum {string} */
        role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
      };
      demoted?: {
        activityId: string;
        contactId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        /** @enum {string} */
        role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
      };
    };
    Contact: {
      contactId: string;
      userId: string | null;
      firstName: string | null;
      lastName: string | null;
      phoneNumber: string | null;
      email: string | null;
      contactPreference: string | null;
      contactApplicantRelationship: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      activityContact?: {
        activityId: string;
        contactId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        /** @enum {string} */
        role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
        activity?: {
          activityId: string;
          initiativeId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          activityContact: unknown[];
        };
      }[];
      user?: components['schemas']['User'];
    };
    User: {
      userId: string;
      idp: string | null;
      sub: string;
      email: string | null;
      firstName: string | null;
      fullName: string | null;
      lastName: string | null;
      active: boolean;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      bceidBusinessName: string | null;
      groups?: {
        groupId: number;
        initiativeCode: string;
        initiativeId: string;
        /** @enum {string} */
        name: 'DEVELOPER' | 'PROPONENT' | 'NAVIGATOR' | 'NAVIGATOR_READ_ONLY' | 'SUPERVISOR' | 'ADMIN';
        label: string;
      }[];
    } | null;
    ElectrificationProject: {
      electrificationProjectId: string;
      activityId: string;
      assignedUserId: string | null;
      /** Format: date-time */
      submittedAt: string;
      applicationStatus: string | null;
      queuePriority: number | null;
      projectName: string | null;
      projectDescription: string | null;
      companyNameRegistered: string | null;
      bcHydroNumber: string | null;
      submissionType: string | null;
      hasEpa: string | null;
      bcEnvironmentAssessNeeded: string | null;
      locationDescription: string | null;
      aaiUpdated: boolean;
      atsClientId: number | null;
      astNotes: string | null;
      projectType: string | null;
      projectCategory: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      atsEnquiryId: number | null;
      addedToAts: boolean;
      companyIdRegistered: string | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
          contact: {
            contactId: string;
            userId: string | null;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string | null;
            email: string | null;
            contactPreference: string | null;
            contactApplicantRelationship: string | null;
            createdBy: string | null;
            /** Format: date-time */
            createdAt: string | null;
            updatedBy: string | null;
            /** Format: date-time */
            updatedAt: string | null;
            deletedBy: string | null;
            /** Format: date-time */
            deletedAt: string | null;
          };
        }[];
        initiative?: {
          initiativeId: string;
          code: string;
          label: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
        };
        _count?: {
          permit: number;
        };
      };
      user?: components['schemas']['User'];
      projectId: string;
      megawatts: string | null;
    };
    SearchElectrificationProjectsResponse: {
      projects: components['schemas']['ElectrificationProject'][];
      totalRecords: number;
    };
    ElectrificationProjectStatistics: {
      total_submissions: number;
      total_submissions_between: number;
      total_submissions_monthyear: number;
      total_submissions_assignedto: number;
      state_new: number;
      state_inprogress: number;
      state_delayed: number;
      state_completed: number;
      queue_1: number;
      queue_2: number;
      queue_3: number;
      escalation: number;
      general_enquiry: number;
      guidance: number;
      inapplicable: number;
      status_request: number;
      multi_permits_needed: number;
    };
    Draft: {
      draftId: string;
      activityId: string;
      draftCode: string;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
        }[];
      };
      data?: Record<string, never>;
    };
    AccessRequest: {
      accessRequestId: string;
      userId: string;
      groupId: number;
      /** @enum {string} */
      status: 'Approved' | 'Pending' | 'Rejected';
      grant: boolean;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      group: {
        groupId: number;
        initiativeId: string;
        name: string;
        label: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
      };
    };
    Document: {
      documentId: string;
      activityId: string | null;
      filename: string;
      mimeType: string;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      createdByFullName?: string;
      filesize: number;
    };
    Enquiry: {
      enquiryId: string;
      activityId: string;
      assignedUserId: string | null;
      submissionType: string | null;
      /** Format: date-time */
      submittedAt: string;
      submittedBy: string;
      relatedActivityId: string | null;
      enquiryDescription: string | null;
      enquiryStatus: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      atsClientId: number | null;
      addedToAts: boolean;
      /** @enum {string} */
      submittedMethod: 'Email' | 'Phone' | 'PCNS';
      atsEnquiryId: number | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
          contact: {
            contactId: string;
            userId: string | null;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string | null;
            email: string | null;
            contactPreference: string | null;
            contactApplicantRelationship: string | null;
            createdBy: string | null;
            /** Format: date-time */
            createdAt: string | null;
            updatedBy: string | null;
            /** Format: date-time */
            updatedAt: string | null;
            deletedBy: string | null;
            /** Format: date-time */
            deletedAt: string | null;
          };
        }[];
        initiative?: {
          initiativeId: string;
          code: string;
          label: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
        };
        _count?: {
          permit: number;
        };
      };
      user?: components['schemas']['User'];
    };
    CreateEnquiryResponse: {
      enquiryId: string;
      activityId: string;
      assignedUserId: string | null;
      submissionType: string | null;
      /** Format: date-time */
      submittedAt: string;
      submittedBy: string;
      relatedActivityId: string | null;
      enquiryDescription: string | null;
      enquiryStatus: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      atsClientId: number | null;
      addedToAts: boolean;
      /** @enum {string} */
      submittedMethod: 'Email' | 'Phone' | 'PCNS';
      atsEnquiryId: number | null;
      contact: {
        contactId: string;
        userId: string | null;
        firstName: string | null;
        lastName: string | null;
        phoneNumber: string | null;
        email: string | null;
        contactPreference: string | null;
        contactApplicantRelationship: string | null;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
      };
    };
    NoteHistory: {
      noteHistoryId: string;
      activityId: string;
      type: string;
      title: string;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      /** Format: date-time */
      bringForwardDate: string | null;
      bringForwardState: string | null;
      shownToProponent: boolean;
      escalateToSupervisor: boolean;
      escalateToDirector: boolean;
      escalationType: string | null;
      note?: {
        noteId: string;
        noteHistoryId: string;
        note: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
      }[];
    };
    BringForward: {
      activityId: string;
      noteHistoryId: string;
      projectId?: string;
      enquiryId?: string;
      /** @enum {string} */
      initiative?: 'PCNS' | 'ELECTRIFICATION' | 'GENERAL' | 'HOUSING';
      title: string;
      projectName: string | null;
      bringForwardDate?: string;
      createdByFullName: string | null;
      escalateToSupervisor: boolean;
      escalateToDirector: boolean;
    };
    Permit: {
      permitId: string;
      permitTypeId: number;
      activityId: string;
      issuedPermitId: string | null;
      state: string;
      needed: string | null;
      stage: string;
      submittedDate: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      statusLastVerified: string | null;
      decisionDate: string | null;
      statusLastChanged: string | null;
      decisionTime: string | null;
      statusLastChangedTime: string | null;
      statusLastVerifiedTime: string | null;
      submittedTime: string | null;
      /** Format: date-time */
      targetDate: string | null;
      targetDateDescription: string | null;
      onHoldCode: string | null;
      technicalReviewer: string | null;
      consultationStartDate: string | null;
      consultationEndDate: string | null;
      consultationStartTime: string | null;
      consultationEndTime: string | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
        }[];
      };
      permitType?: components['schemas']['PermitType'];
      permitNote?: {
        permitNoteId: string;
        permitId: string;
        note: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
      }[];
      permitTracking?: components['schemas']['PermitTracking'][];
    };
    PermitType: {
      permitTypeId: number;
      agency: string;
      division: string | null;
      branch: string | null;
      businessDomain: string;
      type: string;
      family: string | null;
      name: string;
      nameSubtype: string | null;
      acronym: string | null;
      trackedInAts: boolean;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      sourceSystem: string | null;
      infoUrl: string | null;
      permitTypeInitiativeXref?: {
        permitTypeId: number;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        initiative: {
          initiativeId: string;
          code: string;
          label: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
        };
      }[];
    };
    PermitTracking: {
      permitTrackingId: number;
      permitId: string;
      trackingId: string | null;
      sourceSystemKindId: number | null;
      shownToProponent: boolean;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      sourceSystemKind?: components['schemas']['SourceSystemKind'];
    };
    SourceSystemKind: {
      sourceSystemKindId: number;
      kind: string | null;
      description: string | null;
      sourceSystem: string;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      integrated: boolean;
      permitTypeIds?: number[];
    } | null;
    SearchPermitsResponse: {
      permits: {
        permitId: string;
        activityId: string;
        permitTypeId: number;
        decisionDate: string | null;
        stage: string;
        state: string;
        statusLastChanged: string | null;
        submittedDate: string | null;
        permitType: {
          businessDomain: string;
          name: string;
        };
        project: {
          projectId: string;
          projectName: string | null;
          companyNameRegistered: string | null;
          streetAddress?: string | null;
          locality?: string | null;
          province?: string | null;
        } | null;
      }[];
      totalRecords: number;
    };
    GeneralProject: {
      generalProjectId: string;
      activityId: string;
      assignedUserId: string | null;
      /** Format: date-time */
      submittedAt: string;
      locationPids: string | null;
      companyNameRegistered: string | null;
      projectName: string | null;
      streetAddress: string | null;
      queuePriority: number | null;
      relatedPermits: string | null;
      astNotes: string | null;
      atsClientId: number | null;
      naturalDisaster: boolean;
      aaiUpdated: boolean;
      applicationStatus: string | null;
      projectNumber: string | null;
      projectDescription: string | null;
      projectApplicantType: string | null;
      projectLocation: string | null;
      projectLocationDescription: string | null;
      locality: string | null;
      province: string | null;
      hasAppliedProvincialPermits: string | null;
      checkProvincialPermits: string | null;
      submissionType: string | null;
      geoJson?: unknown;
      geomarkUrl: string | null;
      atsEnquiryId: number | null;
      companyIdRegistered: string | null;
      region: string | null;
      area: string | null;
      activityType: string | null;
      businessArea: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
          contact: {
            contactId: string;
            userId: string | null;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string | null;
            email: string | null;
            contactPreference: string | null;
            contactApplicantRelationship: string | null;
            createdBy: string | null;
            /** Format: date-time */
            createdAt: string | null;
            updatedBy: string | null;
            /** Format: date-time */
            updatedAt: string | null;
            deletedBy: string | null;
            /** Format: date-time */
            deletedAt: string | null;
          };
        }[];
        initiative?: {
          initiativeId: string;
          code: string;
          label: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
        };
        _count?: {
          permit: number;
        };
      };
      user?: components['schemas']['User'];
      projectId: string;
      latitude: string | null;
      longitude: string | null;
    };
    SearchGeneralProjectsResponse: {
      projects: components['schemas']['GeneralProject'][];
      totalRecords: number;
    };
    GeneralProjectStatistics: {
      total_submissions: number;
      total_submissions_between: number;
      total_submissions_monthyear: number;
      total_submissions_assignedto: number;
      state_new: number;
      state_inprogress: number;
      state_delayed: number;
      state_completed: number;
      queue_1: number;
      queue_2: number;
      queue_3: number;
      escalation: number;
      general_enquiry: number;
      guidance: number;
      inapplicable: number;
      status_request: number;
      multi_permits_needed: number;
    };
    HousingProject: {
      housingProjectId: string;
      activityId: string;
      assignedUserId: string | null;
      /** Format: date-time */
      submittedAt: string;
      submittedBy: string;
      locationPids: string | null;
      companyNameRegistered: string | null;
      projectName: string | null;
      singleFamilyUnits: string | null;
      streetAddress: string | null;
      queuePriority: number | null;
      relatedPermits: string | null;
      astNotes: string | null;
      astUpdated: boolean;
      addedToAts: boolean;
      atsClientId: number | null;
      ltsaCompleted: boolean;
      bcOnlineCompleted: boolean;
      naturalDisaster: boolean;
      financiallySupported: boolean;
      financiallySupportedBc: string | null;
      financiallySupportedIndigenous: string | null;
      financiallySupportedNonProfit: string | null;
      financiallySupportedHousingCoop: string | null;
      aaiUpdated: boolean;
      applicationStatus: string | null;
      createdBy: string | null;
      /** Format: date-time */
      createdAt: string | null;
      updatedBy: string | null;
      /** Format: date-time */
      updatedAt: string | null;
      deletedBy: string | null;
      /** Format: date-time */
      deletedAt: string | null;
      hasRentalUnits: string | null;
      projectDescription: string | null;
      projectApplicantType: string | null;
      multiFamilyUnits: string | null;
      otherUnits: string | null;
      otherUnitsDescription: string | null;
      rentalUnits: string | null;
      projectLocation: string | null;
      projectLocationDescription: string | null;
      locality: string | null;
      province: string | null;
      hasAppliedProvincialPermits: string | null;
      checkProvincialPermits: string | null;
      indigenousDescription: string | null;
      nonProfitDescription: string | null;
      housingCoopDescription: string | null;
      submissionType: string | null;
      consentToFeedback: boolean;
      geoJson?: unknown;
      geomarkUrl: string | null;
      atsEnquiryId: number | null;
      companyIdRegistered: string | null;
      activity?: {
        activityId: string;
        initiativeId: string;
        createdBy: string | null;
        /** Format: date-time */
        createdAt: string | null;
        updatedBy: string | null;
        /** Format: date-time */
        updatedAt: string | null;
        deletedBy: string | null;
        /** Format: date-time */
        deletedAt: string | null;
        activityContact: {
          activityId: string;
          contactId: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
          /** @enum {string} */
          role: 'PRIMARY' | 'ADMIN' | 'MEMBER';
          contact: {
            contactId: string;
            userId: string | null;
            firstName: string | null;
            lastName: string | null;
            phoneNumber: string | null;
            email: string | null;
            contactPreference: string | null;
            contactApplicantRelationship: string | null;
            createdBy: string | null;
            /** Format: date-time */
            createdAt: string | null;
            updatedBy: string | null;
            /** Format: date-time */
            updatedAt: string | null;
            deletedBy: string | null;
            /** Format: date-time */
            deletedAt: string | null;
          };
        }[];
        initiative?: {
          initiativeId: string;
          code: string;
          label: string;
          createdBy: string | null;
          /** Format: date-time */
          createdAt: string | null;
          updatedBy: string | null;
          /** Format: date-time */
          updatedAt: string | null;
          deletedBy: string | null;
          /** Format: date-time */
          deletedAt: string | null;
        };
        _count?: {
          permit: number;
        };
      };
      user?: components['schemas']['User'];
      projectId: string;
      latitude: string | null;
      longitude: string | null;
    };
    SearchHousingProjectsResponse: {
      projects: components['schemas']['HousingProject'][];
      totalRecords: number;
    };
    HousingProjectStatistics: {
      total_submissions: number;
      total_submissions_between: number;
      total_submissions_monthyear: number;
      total_submissions_assignedto: number;
      state_new: number;
      state_inprogress: number;
      state_delayed: number;
      state_completed: number;
      queue_1: number;
      queue_2: number;
      queue_3: number;
      escalation: number;
      general_enquiry: number;
      guidance: number;
      inapplicable: number;
      status_request: number;
      multi_permits_needed: number;
      supported_bc: number;
      supported_indigenous: number;
      supported_non_profit: number;
      supported_housing_coop: number;
    };
    PermitTypeWithInitiatives: components['schemas']['PermitType'] & Record<string, never>;
    ReportingPermitData: {
      project_name: string | null;
      first_name: string | null;
      last_name: string | null;
      phone_number: string | null;
      email: string | null;
      contact_preference: string | null;
      contact_applicant_relationship: string | null;
      activity_id: string;
      submission_type: string | null;
      application_status: string | null;
      issued_permit_id: string | null;
      tracking_id: string | null;
      state: string | null;
      needed: string | null;
      stage: string | null;
      /** Format: date-time */
      submitted_date: string | null;
      /** Format: date-time */
      submitted_time: string | null;
      /** Format: date-time */
      decision_date: string | null;
      /** Format: date-time */
      decision_time: string | null;
      /** Format: date-time */
      status_last_verified: string | null;
      /** Format: date-time */
      status_last_verified_time: string | null;
      /** Format: date-time */
      status_last_changed: string | null;
      /** Format: date-time */
      status_last_changed_time: string | null;
      agency: string | null;
      division: string | null;
      branch: string | null;
      permit_type: string | null;
      family: string | null;
      name: string | null;
      acronym: string | null;
      tracked_in_ats: boolean | null;
      source_system: string | null;
      source_system_acronym: string | null;
    };
    HousingReportingPermitData: components['schemas']['ReportingPermitData'] & {
      /** @enum {string} */
      consent_to_feedback: 'Yes' | 'No';
      street_address: string | null;
      locality: string | null;
      latitude: string | null;
      longitude: string | null;
      location_pids: string | null;
    };
  };
  responses: never;
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
