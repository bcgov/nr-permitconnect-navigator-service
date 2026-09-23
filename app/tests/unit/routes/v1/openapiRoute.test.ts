import express from 'express';
import request from 'supertest';
import { z } from 'zod';

import { openapiRoute } from '#src/routes/v1/openapiRoute';
import { registry } from '#src/schemas/openapi';

import type { RequestHandler } from 'express';
import type { OpenApiResponses } from '#src/routes/v1/openapiRoute';

const paramsSchema = z.object({ id: z.string().uuid() }).strict();
const bodySchema = z.object({ name: z.string().min(1) }).strict();
const VALID_ID = '3fa1b2c3-4d5e-4f60-8a1b-2c3d4e5f6071';

type TestHandler = RequestHandler<{ id: string }, unknown, { name: string }, never>;

const buildApp = (
  options: { middleware?: RequestHandler[]; handler?: TestHandler; responses?: OpenApiResponses } = {}
) => {
  const router = express.Router();
  router.use(express.json());
  const handler: TestHandler =
    options.handler ?? vi.fn((req, res) => res.status(200).json({ id: req.params.id, body: req.body }));

  openapiRoute('/things', router, {
    method: 'post',
    path: '/:id',
    summary: 'test route',
    tags: ['Test'],
    schema: { params: paramsSchema, body: bodySchema },
    responses: options.responses ?? { 200: { description: 'ok' } },
    middleware: options.middleware,
    handler
  });

  // basePath is only used for the OpenAPI path string - the caller mounts the router at that prefix.
  const app = express();
  app.use('/things', router);
  return { app, handler };
};

describe('openapiRoute', () => {
  it('accepts a valid request on a templated path and passes parsed data to the handler', async () => {
    const { app } = buildApp();

    const res = await request(app).post(`/things/${VALID_ID}`).send({ name: 'ok' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: VALID_ID, body: { name: 'ok' } });
  });

  it('rejects invalid input with a 422 before the handler runs', async () => {
    const { app, handler } = buildApp();

    const res = await request(app).post('/things/not-a-uuid').send({ name: 'ok' });

    expect(res.status).toBe(422);
    expect(handler).not.toHaveBeenCalled();
  });

  it('runs middleware, then validation, then the handler, in order', async () => {
    const order: string[] = [];
    const middleware = (_req: express.Request, _res: express.Response, next: express.NextFunction) => {
      order.push('middleware');
      next();
    };
    const handler = vi.fn((_req: express.Request, res: express.Response) => {
      order.push('handler');
      res.status(200).end();
    });

    const { app } = buildApp({ middleware: [middleware], handler });
    await request(app).post(`/things/${VALID_ID}`).send({ name: 'ok' });

    expect(order).toEqual(['middleware', 'handler']);
  });

  it('registers the OpenAPI path with {param} template syntax and the given schema/responses', () => {
    const registerSpy = vi.spyOn(registry, 'registerPath');
    const responseSchema = z.object({ id: z.string() });

    buildApp({ responses: { 200: { description: 'ok', schema: responseSchema }, 404: { description: 'not found' } } });

    expect(registerSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'post',
        path: '/things/{id}',
        summary: 'test route',
        tags: ['Test'],
        request: expect.objectContaining({
          params: paramsSchema,
          body: { content: { 'application/json': { schema: bodySchema } } }
        }),
        responses: {
          200: { description: 'ok', content: { 'application/json': { schema: responseSchema } } },
          404: { description: 'not found' }
        }
      })
    );

    registerSpy.mockRestore();
  });
});
