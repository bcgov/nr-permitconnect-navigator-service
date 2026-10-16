import type { operations } from './generated';

// Initiatives as they appear in generated ids of per-initiative operations, e.g. `patch${ApiInitiative}Project`
export type ApiInitiative = 'Electrification' | 'General' | 'Housing';

/**
 * JSON request body of an API operation, by its operationId in the types generated from the backend OpenAPI spec.
 * A union of ids gives the union of their bodies.
 * @example RequestBody<'patchHousingProject'>
 */
export type RequestBody<Id extends keyof operations> = Id extends unknown
  ? operations[Id] extends { requestBody?: { content: { 'application/json': infer B } } }
    ? B
    : never
  : never;

/**
 * Query string parameters of an API operation, by its operationId in the generated OpenAPI types.
 * A union of ids gives the union of their parameters.
 * @example QueryParams<'getHousingProjectStatistics'>
 */
export type QueryParams<Id extends keyof operations> = Id extends unknown
  ? operations[Id] extends { parameters: { query?: infer Q } }
    ? NonNullable<Q>
    : never
  : never;
