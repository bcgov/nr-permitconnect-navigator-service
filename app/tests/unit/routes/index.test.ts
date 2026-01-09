import express from 'express';
import request from 'supertest';

import { state } from '../../../state.ts';
import router from '../../../src/routes/index.ts';

const app = express();
app.use(router);

jest.mock('config', () => ({
  has: jest.fn(),
  get: jest.fn()
}));

describe('GET /', () => {
  it('should return the root endpoints', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        endpoints: ['/api', '/docs', '/live', '/ready']
      })
    );
  });

  it('should return the git revision', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        gitRev: state.gitRev
      })
    );
  });
});

describe('GET /live', () => {
  it('should return 200 with status "ok"', async () => {
    const response = await request(app).get('/live');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('GET /ready', () => {
  beforeEach(() => {
    state.ready = false;
  });

  it('should return 200 with status "ready" when state.ready is true', async () => {
    state.ready = true;
    const response = await request(app).get('/ready');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ready' });
  });

  it('should return 503 with status "not ready" when state.ready is false', async () => {
    state.ready = false;
    const response = await request(app).get('/ready');
    expect(response.status).toBe(503);
    expect(response.body).toEqual(expect.objectContaining({ status: 'not ready' }));
  });
});
