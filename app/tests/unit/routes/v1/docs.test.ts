import express from 'express';
import request from 'supertest';

import router from '../../../../src/routes/v1/docs';

const app = express();
app.use(router);

describe('Docs Router', () => {
  describe('GET /', () => {
    it('should return OpenAPI documentation HTML', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.text).toContain('<!DOCTYPE html>');
    });
  });

  describe('GET /api-spec.yaml', () => {
    it('should return OpenAPI YAML spec', async () => {
      const response = await request(app).get('/api-spec.yaml');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/yaml');
      expect(response.text).toContain('openapi:');
    });
  });

  describe('GET /api-spec.json', () => {
    it('should return OpenAPI JSON spec', async () => {
      const response = await request(app).get('/api-spec.json');
      expect(response.status).toBe(200);
      expect(response.type).toBe('application/json');
      expect(response.body).toHaveProperty('openapi');
    });
  });
});
