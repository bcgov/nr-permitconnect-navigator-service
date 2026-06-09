import { createObject, deleteObject, getObject, downloadObject, comsService } from '@/services/comsService';
import { comsAxios } from '@/services/interceptors';
import type { AxiosInstance } from 'axios';

vi.mock('@/services/interceptors', () => ({
  comsAxios: vi.fn()
}));

describe('comsService', () => {
  const mockPut = vi.fn();
  const mockGet = vi.fn();
  const mockDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(comsAxios).mockReturnValue({
      put: mockPut,
      get: mockGet,
      delete: mockDelete
    } as unknown as AxiosInstance);
  });

  describe('createObject', () => {
    it('creates an object with metadata and tagset', async () => {
      const file = new File(['hello'], 'test.txt', {
        type: 'text/plain'
      });

      const response = {
        id: 'obj-1',
        name: 'test.txt'
      };

      mockPut.mockResolvedValue({ data: response });

      const result = await createObject({
        file,
        bucketId: 'bucket-1',
        metadata: [{ key: 'color', value: 'red' }],
        tagset: [{ key: 'priority', value: 'high' }]
      });

      expect(mockPut).toHaveBeenCalledWith(
        'object',
        file,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'text/plain',
            color: 'red'
          }),
          params: expect.objectContaining({
            bucketId: 'bucket-1',
            tagset: {
              priority: 'high'
            }
          })
        })
      );

      expect(result).toEqual(response);
    });

    it('handles missing metadata and tagset', async () => {
      const file = new File(['hello'], 'test.txt');

      mockPut.mockResolvedValue({
        data: { id: 'obj-1' }
      });

      await createObject({ file });

      expect(mockPut).toHaveBeenCalledWith(
        'object',
        file,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/octet-stream'
          }),
          params: expect.objectContaining({
            bucketId: undefined,
            tagset: {}
          })
        })
      );
    });

    it('propagates errors', async () => {
      mockPut.mockRejectedValue(new Error('upload failed'));

      await expect(
        createObject({
          file: new File(['x'], 'x.txt')
        })
      ).rejects.toThrow('upload failed');
    });
  });

  describe('deleteObject', () => {
    it('deletes object with versionId', async () => {
      mockDelete.mockResolvedValue({});

      await deleteObject({
        objectId: 'obj-1',
        versionId: 'v1'
      });

      expect(mockDelete).toHaveBeenCalledWith('object/obj-1', {
        params: {
          versionId: 'v1'
        }
      });
    });

    it('handles missing versionId', async () => {
      mockDelete.mockResolvedValue({});

      await deleteObject({
        objectId: 'obj-1'
      });

      expect(mockDelete).toHaveBeenCalledWith('object/obj-1', {
        params: {
          versionId: undefined
        }
      });
    });

    it('propagates errors', async () => {
      mockDelete.mockRejectedValue(new Error('delete failed'));

      await expect(deleteObject({ objectId: 'obj-1' })).rejects.toThrow('delete failed');
    });
  });

  describe('getObject', () => {
    it('returns ArrayBuffer', async () => {
      const buffer = new ArrayBuffer(8);

      mockGet.mockResolvedValue({
        data: buffer
      });

      const result = await getObject({
        objectId: 'obj-1',
        versionId: 'v1'
      });

      expect(mockGet).toHaveBeenCalledWith('object/obj-1', {
        params: {
          versionId: 'v1',
          download: 'proxy'
        }
      });

      expect(result).toBe(buffer);
    });

    it('propagates errors', async () => {
      mockGet.mockRejectedValue(new Error('get failed'));

      await expect(getObject({ objectId: 'obj-1' })).rejects.toThrow('get failed');
    });
  });

  describe('downloadObject', () => {
    const clickMock = vi.fn();

    const createElementMock = vi.fn(() => {
      const anchor: Partial<HTMLAnchorElement> = {
        style: {} as CSSStyleDeclaration,
        href: '',
        download: '',
        click: clickMock,
        remove: vi.fn()
      };

      return anchor as HTMLAnchorElement;
    });

    beforeEach(() => {
      global.URL.createObjectURL = vi.fn(() => 'blob:url');
      global.URL.revokeObjectURL = vi.fn();

      document.createElement = createElementMock;
    });

    it('creates and triggers download', async () => {
      mockGet.mockResolvedValue({
        data: new ArrayBuffer(4)
      });

      await downloadObject({
        objectId: 'obj-1',
        filename: 'file.txt'
      });

      expect(mockGet).toHaveBeenCalled();

      expect(global.URL.createObjectURL).toHaveBeenCalled();
      expect(clickMock).toHaveBeenCalled();
      expect(global.URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('propagates getObject errors', async () => {
      mockGet.mockRejectedValue(new Error('download failed'));

      await expect(
        downloadObject({
          objectId: 'obj-1',
          filename: 'file.txt'
        })
      ).rejects.toThrow('download failed');
    });
  });

  it('exports service functions', () => {
    expect(comsService).toEqual({
      createObject,
      deleteObject,
      getObject,
      downloadObject
    });
  });
});
