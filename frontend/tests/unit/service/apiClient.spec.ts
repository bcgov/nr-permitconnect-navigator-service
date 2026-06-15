import { api, apiRaw } from '@/services/apiClient';
import { appAxios } from '@/services/interceptors';

import type { Mock } from 'vitest';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

const mockAxios = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn()
};

describe('api wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (appAxios as unknown as Mock).mockReturnValue(mockAxios);
  });

  describe('api (unwrapped .data)', () => {
    it('get unwraps response data', async () => {
      mockAxios.get.mockResolvedValue({ data: 'result' });

      const res = await api.get<string>('/test');

      expect(mockAxios.get).toHaveBeenCalledWith('/test', undefined);
      expect(res).toBe('result');
    });

    it('get forwards config', async () => {
      mockAxios.get.mockResolvedValue({ data: 'ok' });

      const config = { params: { a: 1 } };

      await api.get('/test', config);

      expect(mockAxios.get).toHaveBeenCalledWith('/test', config);
    });

    it('post unwraps response data', async () => {
      mockAxios.post.mockResolvedValue({ data: { id: 1 } });

      const res = await api.post<{ id: number }>('/test', { foo: 'bar' });

      expect(mockAxios.post).toHaveBeenCalledWith('/test', { foo: 'bar' }, undefined);
      expect(res).toEqual({ id: 1 });
    });

    it('put unwraps response data', async () => {
      mockAxios.put.mockResolvedValue({ data: true });

      const res = await api.put<boolean>('/test', { x: 1 });

      expect(res).toBe(true);
    });

    it('patch unwraps response data', async () => {
      mockAxios.patch.mockResolvedValue({ data: 'patched' });

      const res = await api.patch<string>('/test', { x: 1 });

      expect(res).toBe('patched');
    });

    it('delete unwraps response data', async () => {
      mockAxios.delete.mockResolvedValue({ data: 'deleted' });

      const res = await api.delete<string>('/test');

      expect(mockAxios.delete).toHaveBeenCalledWith('/test', undefined);
      expect(res).toBe('deleted');
    });
  });

  describe('apiRaw (no transformation)', () => {
    it('get returns raw axios response', async () => {
      const axiosResponse = { data: 'raw', status: 200 };

      mockAxios.get.mockResolvedValue(axiosResponse);

      const res = await apiRaw.get('/test');

      expect(res).toBe(axiosResponse);
    });

    it('post returns raw axios response', async () => {
      const axiosResponse = { data: 123 };

      mockAxios.post.mockResolvedValue(axiosResponse);

      const res = await apiRaw.post('/test', { a: 1 });

      expect(res).toBe(axiosResponse);
    });

    it('put returns raw axios response', async () => {
      const axiosResponse = { data: true };

      mockAxios.put.mockResolvedValue(axiosResponse);

      const res = await apiRaw.put('/test', { a: 1 });

      expect(res).toBe(axiosResponse);
    });

    it('patch returns raw axios response', async () => {
      const axiosResponse = { data: 'ok' };

      mockAxios.patch.mockResolvedValue(axiosResponse);

      const res = await apiRaw.patch('/test', { a: 1 });

      expect(res).toBe(axiosResponse);
    });

    it('delete returns raw axios response', async () => {
      const axiosResponse = { data: 'done' };

      mockAxios.delete.mockResolvedValue(axiosResponse);

      const res = await apiRaw.delete('/test');

      expect(res).toBe(axiosResponse);
    });
  });

  describe('edge cases', () => {
    it('handles undefined body in post', async () => {
      mockAxios.post.mockResolvedValue({ data: 'ok' });

      await api.post('/test');

      expect(mockAxios.post).toHaveBeenCalledWith('/test', undefined, undefined);
    });

    it('handles config passed to delete', async () => {
      mockAxios.delete.mockResolvedValue({ data: 'ok' });

      const config = { params: { force: true } };

      await api.delete('/test', config);

      expect(mockAxios.delete).toHaveBeenCalledWith('/test', config);
    });
  });
});
