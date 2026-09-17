import type { Router, RequestHandler } from 'express';
import type { ZodObject, ZodTypeAny } from 'zod';

import { validate } from '#src/middleware/validation';
import { registry } from '#src/validators/openapi';

type Method = 'get' | 'post' | 'patch' | 'put' | 'delete';

interface OpenApiResponseEntry {
  description: string;
  contentType?: string; // default 'application/json'
  schema?: ZodTypeAny;
}
export type OpenApiResponses = Record<number, OpenApiResponseEntry>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches express's own Response Locals bound
interface OpenApiRouteConfig<P, ResBody, ReqBody, ReqQuery, Locals extends Record<string, any>> {
  method: Method;
  path: string;
  summary: string;
  tags: string[];
  // Shape-compatible with a validators/*.ts file's `schema.<operation>` object
  schema?: { params?: ZodObject; query?: ZodObject; body?: ZodTypeAny; bodyContentType?: string };
  responses: OpenApiResponses;
  // Untyped RequestHandler[]: unifying with the narrowly-typed handler below collapses inference for both.
  middleware?: RequestHandler[];
  handler: RequestHandler<P, ResBody, ReqBody, ReqQuery, Locals>;
}

const toOpenApiPath = (path: string) => path.replace(/:([^/]+)/g, '{$1}');

const buildResponses = (responses: OpenApiResponses) =>
  Object.fromEntries(
    Object.entries(responses).map(([status, { description, schema, contentType = 'application/json' }]) => [
      status,
      { description, ...(schema && { content: { [contentType]: { schema } } }) }
    ])
  );

export function openapiRoute<
  P,
  ResBody,
  ReqBody,
  ReqQuery,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches express's own Response Locals bound
  Locals extends Record<string, any> = Record<string, never>
>(basePath: string, router: Router, config: OpenApiRouteConfig<P, ResBody, ReqBody, ReqQuery, Locals>): void {
  const { method, path, summary, tags, schema, responses, middleware = [], handler } = config;

  registry.registerPath({
    method,
    path: `${basePath}${path === '/' ? '' : toOpenApiPath(path)}`,
    summary,
    tags,
    request: {
      ...(schema?.params && { params: schema.params }),
      ...(schema?.query && { query: schema.query }),
      ...(schema?.body && {
        body: { content: { [schema.bodyContentType ?? 'application/json']: { schema: schema.body } } }
      })
    },
    responses: buildResponses(responses)
  });

  const chain = schema
    ? [
        ...middleware,
        validate({
          ...(schema.params && { params: schema.params }),
          ...(schema.query && { query: schema.query }),
          ...(schema.body && { body: schema.body })
        }),
        handler
      ]
    : [...middleware, handler];
  router[method](path, ...(chain as RequestHandler[]));
}
