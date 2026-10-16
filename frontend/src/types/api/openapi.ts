import type { components, operations } from './generated';

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

/**
 * Named schema from the generated OpenAPI types, such as a response resource.
 * @example Schema<'AccessRequest'>
 */
export type Schema<Name extends keyof components['schemas']> = components['schemas'][Name];

/**
 * JSON body of an API operation's success (200 or 201) response, by its operationId in the generated OpenAPI types.
 * A union of ids gives the union of their bodies; an operation with no success body (e.g. 204) gives never.
 * @example ResponseBody<'getHousingProject'>
 */
export type ResponseBody<Id extends keyof operations> = Id extends unknown
  ? operations[Id]['responses'] extends infer R
    ? {
        [S in keyof R & (200 | 201)]: R[S] extends { content: { 'application/json': infer B } } ? B : never;
      }[keyof R & (200 | 201)]
    : never
  : never;
