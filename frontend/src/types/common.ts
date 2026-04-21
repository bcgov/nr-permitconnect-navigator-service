import type { ElectrificationProject, GeneralProject, HousingProject } from './index';

/**
 * Utility
 */
export type CallbackFn = (...args: unknown[]) => void;
export type DeepPartial<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T extends object
      ? { [K in keyof T]?: DeepPartial<T[K]> }
      : T;
export type DeepRequired<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends readonly (infer U)[]
    ? readonly DeepRequired<U>[]
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<T[K]> }
      : T;
export type Maybe<T> = T | null | undefined;
export type MaybeUndefined<T> = T | undefined;
export type Nullable<T> = T | null;
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Replace<T, R> = Omit<T, keyof R> & R;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ValueOf<T> = T[keyof T];
export type UUID = string; // nosonar

/**
 * PCNS Specific
 */
export type Project = ElectrificationProject | GeneralProject | HousingProject;
