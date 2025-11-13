/**
 * This file was created by nr-peach
 * @see https://github.com/bcgov/nr-peach/blob/main/src/types/elements.d.ts
 */

/**
 * Represents a specific record.
 */
export type Record = Record1 & Record2;
export type Record1 = Header;
/**
 * A code symbol representing the primary code value.
 */
export type Code = string;
/**
 * Represents an event concept. It allows either a date or a datetime, but not a mix of both. One of the start
 * properties is required, but the end properties are optional.
 */
export type Event = Event1 & Event2;
export type Event2 = Date | DateTime;
/**
 * Represents a process tracking concept.
 */
export type Process = Process1 & Process2;
export type Process1 = Coding;

/**
 * Represents a set of standardized attributes needed for identification and attribution.
 */
export interface Header {
  /**
   * A unique UUIDv7 assigned for this specific message.
   */
  transaction_id: string;
  /**
   * The PIES specification version this message complies to. Value shall be a valid semantic version formatted string.
   */
  version: string;
  /**
   * The specific kind of PIES message data type this message represents.
   */
  kind: 'Record' | 'RecordLinkage';
  /**
   * A valid NRIDS IT Service Management code which identifies the source system, service or asset that the data
   * originates from.
   */
  system_id: string;
  /**
   * The record or primary key representing what the data this message is directly associated to.
   */
  record_id: string;
  /**
   * The kind of record the source system stores this record as (i.e. Permit, Project, Submission or Tracking).
   */
  record_kind: 'Permit' | 'Project' | 'Submission' | 'Tracking';
}
export interface Record2 {
  on_hold_event_set: CodingEvent[];
  process_event_set: [ProcessEvent, ...ProcessEvent[]];
}
/**
 * Represents a coding concept at a specific event in time.
 */
export interface CodingEvent {
  coding: Coding;
  event: Event;
}
/**
 * A representation of a defined concept using a symbol from a defined Code System.
 */
export interface Coding {
  code: Code;
  /**
   * A human-readable display name for the code value, intended for readability and not computation.
   */
  code_display?: string;
  /**
   * An ordered set of code symbols, where the last element must match the code attribute. The set must contain at least
   * one symbol, preserve order, and not include duplicates.
   */
  code_set: [Code] | [Code, Code] | [Code, Code, Code];
  /**
   * An identifying URI string representing the source code system for the code value.
   */
  code_system: string;
}
export interface Event1 {
  /**
   * The start date of the event in RFC 3339 format (e.g., `2024-12-01`).
   */
  start_date?: string;
  /**
   * The start datetime of the event in RFC 3339 format (e.g., `2024-12-01T10:00:00.0000000Z`). Only UTC time is
   * allowed.
   */
  start_datetime?: string;
  /**
   * The end date of the event in RFC 3339 format (e.g., `2024-12-01`). This is optional if `start_date` is used.
   */
  end_date?: string;
  /**
   * The end datetime of the event in RFC 3339 format (e.g., `2024-12-01T10:00:00.0000000Z`). Only UTC time is allowed.
   * This is optional if `start_datetime` is used.
   */
  end_datetime?: string;
}
/**
 * This schema is used when the event starts with a date (`start_date`), and optionally, an end date (`end_date`) can be
 * specified. Mixing a start date with a datetime is not allowed.
 */
export interface Date {
  start_date: string;
  end_date?: string;
}
/**
 * This schema is used when the event starts with a datetime (`start_datetime`), and optionally, an end datetime
 * (`end_datetime`) can be specified. Mixing a start datetime with a date is not allowed.
 */
export interface DateTime {
  start_datetime: string;
  end_datetime?: string;
}
/**
 * Represents a process concept at a specific event in time.
 */
export interface ProcessEvent {
  event: Event;
  process: Process;
}
export interface Process2 {
  /**
   * An optional description of the current condition or update of an application or authorization. Additional details
   * about the current state are frequently conveyed (e.g., 'Pending Review', 'Under Inspection'). Statuses may be
   * defined by the line of business.
   */
  status?: string;
  /**
   * An optional codified representation of the status attribute. Status codes may be defined by the line of business.
   */
  status_code?: string;
  /**
   * An optional description of the status if present.
   */
  status_description?: string;
}

/**
 * Represents an assertion for a specific record to be related or linked together.
 */
export type RecordLinkage = RecordLinkage1 & RecordLinkage2;
export type RecordLinkage1 = Header;

export interface RecordLinkage2 {
  /**
   * A valid NRIDS IT Service Management code which identifies the source system,
   * service or asset that the linked data originates from.
   */
  linked_system_id: string;
  /**
   * The record or primary key representing what record should be linked with the primary header record.
   */
  linked_record_id: string;
  /**
   * The kind of record the source system stores this linked record as (i.e. Permit, Project, Submission or Tracking).
   */
  linked_record_kind: 'Permit' | 'Project' | 'Submission' | 'Tracking';
}
