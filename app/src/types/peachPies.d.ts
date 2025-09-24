// TODO-PR Do we really need these types? Should I just be using the model file from peach repo?

/** Field level types */
export type CodeSystemURI = `https://bcgov.github.io/nr-pies/docs/spec/code_system/${string}`;
export type NonEmptyArray<T> = readonly [T, ...T[]];
export type OneToThree<T> = readonly [T] | [T, T] | [T, T, T];
export type ITSMCode = `ITSM-${number}` & { readonly __brand: 'ITSM' };
export type ISODate = `${number}-${number}-${number}` & { readonly __brand: 'ISODate' }; // e.g., 2024-12-01
export type UTCDateTime = `${string}Z` & { readonly __brand: 'UTCDateTime' };
export type UUIDv7 = string & { readonly __brand: 'UUIDv7' };
export type Version = string & { readonly __brand: 'SemVer' };

/** Date Event types */
type DateEvent = {
  start_date: ISODate;
  end_date?: ISODate;
  // explicitly forbid datetime keys on this branch
  start_datetime?: never;
  end_datetime?: never;
};

type DateTimeEvent = {
  start_datetime: UTCDateTime;
  end_datetime?: UTCDateTime;
  // explicitly forbid date keys on this branch
  start_date?: never;
  end_date?: never;
};

/**
 * PIES Code Element Type
 * Pattern: ^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)*$
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/data/code
 */
export type Code = string & { readonly __brand: 'CodeSymbol' };

/** PIES Coding Element Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/data/coding */
export interface Coding {
  code: Code;
  code_display?: string;
  code_set: OneToThree<Code>;
  code_system: CodeSystemURI;
}

/** PIES Process Element Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/data/process */
export interface Process extends Coding {
  status?: string;
  status_code?: string;
  status_description?: string;
}

/** PIES Header Element Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/data/header */
export interface Header {
  transaction_id: UUIDv7;
  version: Version;
  kind: 'ProcessEventSet' | 'Record' | 'RecordLinkage';
  system_id: ITSMCode;
  record_id: string;
  record_kind: 'Permit' | 'Project' | 'Submission' | 'Tracking';
}

/** PIES Event Element Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/data/event */
export type PiesEvent = DateEvent | DateTimeEvent;

/** PIES Coding Event Resource Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/resource/coding_event */
export interface CodingEvent {
  coding: Coding;
  event: PiesEvent;
}

/** PIES Process Event Resource Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/resource/process_event */
export interface ProcessEvent {
  event: PiesEvent;
  process: Process;
}

/** PIES Record Message Type
 * @link https://bcgov.github.io/nr-pies/docs/spec/element/message/record */
export type PeachRecord = Header & {
  on_hold_event_set: readonly CodingEvent[];
  process_event_set: NonEmptyArray<ProcessEvent>;
};
