import { appAxios } from '@/services/interceptors';
import { sourceSystemKindService, getSourceSystemKinds } from '@/services/sourceSystemKindService';

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

  describe('getSourceSystemKinds', () => {
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

      const result = await getSourceSystemKinds();

      expect(mockGet).toHaveBeenCalledWith('sourceSystemKind');

      expect(result).toEqual(sourceSystemKinds);
    });

    it('propagates errors', async () => {
      const error = new Error('get failed');

      mockGet.mockRejectedValue(error);

      await expect(getSourceSystemKinds()).rejects.toThrow(error);
    });
  });

  it('exports all service functions', () => {
    expect(sourceSystemKindService).toEqual({
      getSourceSystemKinds
    });
  });
});
