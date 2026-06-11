import { appAxios } from '@/services/interceptors';
import { sourceSystemKindService, listSourceSystemKinds } from '@/services/sourceSystemKindService';

vi.mock('@/services/interceptors', () => ({
  appAxios: vi.fn()
}));

describe('sourceSystemKind service', () => {
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(appAxios).mockReturnValue({
      get: mockGet
    } as never);
  });

  describe('listSourceSystemKinds', () => {
    it('returns source system kinds', async () => {
      const sourceSystemKinds = [
        {
          sourceSystemKindId: '1',
          name: 'System A'
        },
        {
          sourceSystemKindId: '2',
          name: 'System B'
        }
      ];

      mockGet.mockResolvedValue({
        data: sourceSystemKinds
      });

      const result = await listSourceSystemKinds();

      expect(mockGet).toHaveBeenCalledWith('sourceSystemKind');

      expect(result).toEqual(sourceSystemKinds);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(listSourceSystemKinds()).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(sourceSystemKindService).toEqual({
      listSourceSystemKinds
    });
  });
});
