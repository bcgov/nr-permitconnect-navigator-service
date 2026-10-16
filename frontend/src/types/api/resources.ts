import type { Schema } from './openapi';
import type { UUID } from '../common';
import type { Nullable } from '../util';
import type { IdentityProviderKind } from '@/utils/enums/application';

/**
 * Shared interfaces
 */
export interface AuditFields {
  createdBy?: Nullable<string>;
  createdAt?: Nullable<string>;
  updatedBy?: Nullable<string>;
  updatedAt?: Nullable<string>;
  deletedBy?: Nullable<string>;
  deletedAt?: Nullable<string>;
}

// Filled in by the frontend after fetching
export interface ProjectAnnotations {
  hasRelatedEnquiry?: boolean;
  relatedEnquiries?: string;
}

/**
 * Access Request
 */

export type AccessRequest = Schema<'AccessRequest'>;

/**
 * Activity
 */

export interface Activity extends AuditFields {
  activityId: string;
  initiativeId: UUID;

  _count?: { permit: number };

  // Joined
  activityContact?: ActivityContact[];
}

/**
 * Activity Contact
 */

export type ActivityContact = Schema<'ActivityContact'>;

/**
 * Bring Forward
 */

export type BringForward = Schema<'BringForward'>;

/**
 * Contact
 */

export type Contact = Schema<'Contact'>;

/**
 * Document
 */

// extension is derived from the filename after fetching
export type Document = Schema<'Document'> & { extension?: string };

/**
 * Draft
 */

// data holds the drafting form's own values, which the API stores as opaque JSON
export type Draft<T> = Omit<Schema<'Draft'>, 'data'> & { data: T };

/**
 * Electrification Project
 */

export type ElectrificationProject = Schema<'ElectrificationProject'> & ProjectAnnotations;

/**
 * Enquiry
 */

export type Enquiry = Schema<'Enquiry'>;

/**
 * General Project
 */

export type GeneralProject = Schema<'GeneralProject'> & ProjectAnnotations;

/**
 * Group
 */

// The yars group list returns the same shape as a user's groups
export type Group = NonNullable<User['groups']>[number];

/**
 * Housing Project
 */

export type HousingProject = Schema<'HousingProject'> & ProjectAnnotations;

/**
 * Identity Provider
 */

export interface IdentityProvider extends AuditFields {
  idp: string;
  kind: IdentityProviderKind;
  username: string;
}

/**
 * Initiative
 */

export interface Initiative extends AuditFields {
  initiativeId: UUID;
  code: string;
  label: string;
}

/**
 * Note
 */

export type Note = NonNullable<NoteHistory['note']>[number];

/**
 * Note History
 */

export type NoteHistory = Schema<'NoteHistory'>;

/**
 * Permit
 */

export type Permit = Schema<'Permit'>;

export type PermitNote = NonNullable<Permit['permitNote']>[number];

export type PermitTracking = Schema<'PermitTracking'>;

export type PermitType = Schema<'PermitType'>;

// The spec marks the schema itself nullable, as OpenAPI 3.0 cannot mark a single reference to it nullable
export type SourceSystemKind = NonNullable<Schema<'SourceSystemKind'>>;

/**
 * User
 */

// The spec marks the schema itself nullable, as OpenAPI 3.0 cannot mark a single reference to it nullable
export type User = NonNullable<Schema<'User'>>;
