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
  // Shape-compatible with a validators/*.ts file's `schema.<operation>` object, so it can be passed
  // straight through (e.g. `schema: schema.searchHousingProjects`). bodyContentType only needs setting
  // for a non-JSON body (e.g. 'application/pdf'); everything else defaults to JSON.
  schema?: { params?: ZodObject; query?: ZodObject; body?: ZodTypeAny; bodyContentType?: string };
  responses: OpenApiResponses;
  // Middleware (auth checks etc.) is deliberately untyped to the route's own P/ResBody/ReqQuery/Locals -
  // it's always written against bare Request/Response in this codebase, and unifying it with the
  // narrowly-typed handler below made inference collapse to the widest common type for both.
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
  // Internal wiring only - the mismatched generics across middleware/validate()/handler don't unify
  // cleanly here the way they do at a native router.get(...) call site; the public config above stays
  // fully typed, so callers still get real inference on `handler`/`middleware`.
  router[method](path, ...(chain as RequestHandler[]));
}
