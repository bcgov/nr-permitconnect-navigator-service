import type { IStamps } from '@/interfaces';

/** Helpers for creating API DTOs */
export type WithoutAudit<T> = Omit<T, keyof IStamps>;
export type CreateDTO<T, Excluded extends keyof T = never> = Omit<WithoutAudit<T>, Excluded>;
export type DeleteDTO<T, IdFields extends readonly (keyof T)[]> = Pick<T, IdFields[number]>;
export type PatchDTO<T, Excluded extends keyof T = never> = Partial<Omit<WithoutAudit<T>, Excluded>>;
export type PutDTO<T, Excluded extends keyof T = never> = Omit<WithoutAudit<T>, Excluded>;
