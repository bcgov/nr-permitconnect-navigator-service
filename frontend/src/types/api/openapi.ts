import type { paths } from './generated';

/**
 * JSON request body of an API operation, taken from the types generated from the backend OpenAPI spec.
 * @example RequestBody<'/housing/project/{housingProjectId}', 'patch'>
 */
export type RequestBody<P extends keyof paths, M extends keyof paths[P]> = paths[P][M] extends {
  requestBody?: { content: { 'application/json': infer B } };
}
  ? B
  : never;
