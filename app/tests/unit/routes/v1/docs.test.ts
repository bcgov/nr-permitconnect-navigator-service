import express from 'express';
import helmet from 'helmet';
import { dump } from 'js-yaml';
import request from 'supertest';

import { getDocHTML, getSpec } from '#src/docs/docs';
import router from '#src/routes/v1/docs';

// Mock dependencies
vi.mock('helmet', () => ({
  default: {
    contentSecurityPolicy: vi.fn(() => (_req: unknown, _res: unknown, next: () => void) => next())
  }
}));

vi.mock('js-yaml', () => ({
  dump: vi.fn()
}));

vi.mock('../../../../src/docs/docs', () => ({
  getDocHTML: vi.fn(),
  getSpec: vi.fn()
}));

const app = express();
app.use(router);

describe('Docs Router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return HTML documentation', async () => {
      const mockHtml = '<html>Mock Docs</html>';
      vi.mocked(getDocHTML).mockReturnValue(mockHtml);

      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe(mockHtml);
      expect(getDocHTML).toHaveBeenCalled();
    });

    it('should configure CSP with dynamic nonce for img-src and media-src', async () => {
      vi.resetModules();
      await import('../../../../src/routes/v1/docs.ts');

      expect(helmet.contentSecurityPolicy).toHaveBeenCalled();

      const config = vi.mocked(helmet.contentSecurityPolicy).mock.calls[0]?.[0] ?? {};
      const { 'img-src': imgSrc, 'media-src': mediaSrc } = config?.directives as Record<string, unknown[]>;
      const mockRes = { locals: { cspNonce: 'test-nonce' } } as unknown as express.Response;

      const imgNonceFn = imgSrc?.find((fn: unknown) => typeof fn === 'function') as (
        req: unknown,
        res: express.Response
      ) => string;
      const mediaNonceFn = mediaSrc?.find((fn: unknown) => typeof fn === 'function') as (
        req: unknown,
        res: express.Response
      ) => string;

      expect(imgNonceFn(null, mockRes)).toBe("'nonce-test-nonce'"); // eslint-disable-line quotes
      expect(mediaNonceFn(null, mockRes)).toBe("'nonce-test-nonce'"); // eslint-disable-line quotes
    });
  });

  describe('GET /api-spec.yaml', () => {
    it('should return YAML specification', async () => {
      const mockSpec = { openapi: '3.0.0', servers: [], components: {} };
      const mockYaml = 'openapi: 3.0.0';
      vi.mocked(getSpec).mockReturnValue(mockSpec);
      vi.mocked(dump).mockReturnValue(mockYaml);

      const response = await request(app).get('/api-spec.yaml');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/yaml');
      expect(response.text).toBe(mockYaml);
      expect(getSpec).toHaveBeenCalled();
      expect(dump).toHaveBeenCalledWith(mockSpec);
    });
  });

  describe('GET /api-spec.json', () => {
    it('should return JSON specification', async () => {
      const mockSpec = { openapi: '3.0.0', servers: [], components: {} };
      vi.mocked(getSpec).mockReturnValue(mockSpec);

      const response = await request(app).get('/api-spec.json');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toEqual(mockSpec);
      expect(getSpec).toHaveBeenCalled();
    });
  });
});
