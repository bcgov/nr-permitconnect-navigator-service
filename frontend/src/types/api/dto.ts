import type { AuditFields } from './resources';
import type { Simplify } from '../util';

/** Helpers */
type ClientWritable<T> = Omit<T, keyof AuditFields>;
type CreateFields<T, ServerGeneratedFields extends readonly (keyof T)[] = []> = Omit<
  ClientWritable<T>,
  ServerGeneratedFields[number]
>;
type MutableFields<T, ImmutableFields extends readonly (keyof T)[] = []> = Omit<
  ClientWritable<T>,
  ImmutableFields[number]
>;
type PatchFields<T, ImmutableFields extends readonly (keyof T)[] = []> = Partial<MutableFields<T, ImmutableFields>>;
type OptionalResourceKey<T, IdFields extends readonly (keyof T)[]> = Partial<ResourceKey<T, IdFields>>;
type ResourceKey<T, IdFields extends readonly (keyof T)[]> = Pick<T, IdFields[number]>;

/**
 * Resource-derived request generators
 * These are not universal request generators
 */
export type CreateRequestDTO<T, ServerGeneratedFields extends readonly (keyof T)[] = []> = Simplify<
  CreateFields<T, ServerGeneratedFields>
>;
export type GetRequestDTO<T, IdFields extends readonly (keyof T)[]> = Simplify<ResourceKey<T, IdFields>>;
export type ListRequestDTO<T, IdFields extends readonly (keyof T)[]> = Simplify<ResourceKey<T, IdFields>>;
export type PutRequestDTO<
  T,
  IdFields extends readonly (keyof T)[],
  ImmutableFields extends readonly (keyof T)[] = []
> = Simplify<ResourceKey<T, IdFields> & MutableFields<T, [...ImmutableFields, ...IdFields]>>;
export type PatchRequestDTO<
  T,
  IdFields extends readonly (keyof T)[],
  ImmutableFields extends readonly (keyof T)[] = []
> = Simplify<ResourceKey<T, IdFields> & PatchFields<T, [...ImmutableFields, ...IdFields]>>;
export type UpsertRequestDTO<
  T,
  IdFields extends readonly (keyof T)[],
  ImmutableFields extends readonly (keyof T)[] = []
> = Simplify<OptionalResourceKey<T, IdFields> & MutableFields<T, [...ImmutableFields, ...IdFields]>>;
export type DeleteRequestDTO<T, IdFields extends readonly (keyof T)[]> = Simplify<ResourceKey<T, IdFields>>;
