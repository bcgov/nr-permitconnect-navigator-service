import type { Schema } from './openapi';

// Filled in by the frontend after fetching
interface ProjectAnnotations {
  relatedEnquiries?: string;
}

export type AccessRequest = Schema<'AccessRequest'>;
export type ActivityContact = Schema<'ActivityContact'>;
export type BringForward = Schema<'BringForward'>;
export type Contact = Schema<'Contact'>;

// extension is derived from the filename after fetching
export type Document = Schema<'Document'> & { extension?: string };

// data holds the drafting form's own values, which the API stores as opaque JSON
export type Draft<T> = Omit<Schema<'Draft'>, 'data'> & { data: T };

export type ElectrificationProject = Schema<'ElectrificationProject'> & ProjectAnnotations;
export type Enquiry = Schema<'Enquiry'>;
export type GeneralProject = Schema<'GeneralProject'> & ProjectAnnotations;

// The yars group list returns the same shape as a user's groups
export type Group = NonNullable<User['groups']>[number];

export type HousingProject = Schema<'HousingProject'> & ProjectAnnotations;

export type Note = NonNullable<NoteHistory['note']>[number];
export type NoteHistory = Schema<'NoteHistory'>;
export type Permit = Schema<'Permit'>;
export type PermitNote = NonNullable<Permit['permitNote']>[number];
export type PermitTracking = Schema<'PermitTracking'>;
export type PermitType = Schema<'PermitType'>;

// The spec marks these schemas themselves nullable, as OpenAPI 3.0 cannot mark a single reference to one nullable
export type SourceSystemKind = NonNullable<Schema<'SourceSystemKind'>>;
export type User = NonNullable<Schema<'User'>>;
