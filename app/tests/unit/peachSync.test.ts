import * as peachService from '#src/services/peach';
import { syncPeachToPcns } from '../../peachSync.ts';
import { state } from '../../state.ts';

vi.mock('config', async () => {
  const actual = await vi.importActual<{ get: (k: string) => unknown; has: (k: string) => boolean }>('config');
  return {
    default: {
      ...actual,
      get: vi.fn((key: string) => {
        if (key === 'server.env') return 'ci';
        if (key === 'server.pcns.appUrl') return 'www.example.com';
        if (key === 'server.pcbcUrl') return 'www.example.com';

        return actual.get(key);
      }),
      has: vi.fn(() => false)
    }
  };
});

const syncPeachRecordsServiceSpy = vi.spyOn(peachService, 'syncPeachRecordsService');
const sendPeachNotificationsServiceSpy = vi.spyOn(peachService, 'sendPeachNotificationsService');

describe('syncPeachToPcns', () => {
  const originalPeachFlag = state.features.peach;
  const originalExitCode = process.exitCode;

  beforeEach(() => {
    vi.clearAllMocks();
    state.features.peach = true;
    sendPeachNotificationsServiceSpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    state.features.peach = originalPeachFlag;
    process.exitCode = originalExitCode;
  });

  it('does nothing when the peach feature flag is disabled', async () => {
    state.features.peach = false;

    await syncPeachToPcns();

    expect(syncPeachRecordsServiceSpy).not.toHaveBeenCalled();
    expect(sendPeachNotificationsServiceSpy).not.toHaveBeenCalled();
  });

  it('dispatches notifications once the sync has committed successfully', async () => {
    const emails = [{ to: ['proponent@example.com'] }];
    syncPeachRecordsServiceSpy.mockResolvedValueOnce(emails as never);

    await syncPeachToPcns();

    expect(sendPeachNotificationsServiceSpy).toHaveBeenCalledWith(emails);
    expect(process.exitCode).toBe(originalExitCode);
  });

  it('dispatches nothing when the sync produced no emails', async () => {
    syncPeachRecordsServiceSpy.mockResolvedValueOnce([]);

    await syncPeachToPcns();

    expect(sendPeachNotificationsServiceSpy).not.toHaveBeenCalled();
  });

  it('does not dispatch notifications when the write fails to commit', async () => {
    syncPeachRecordsServiceSpy.mockRejectedValueOnce(new Error('db down'));

    await syncPeachToPcns();

    expect(sendPeachNotificationsServiceSpy).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
  });

  it('still resolves, logging a warning, when dispatching notifications itself fails', async () => {
    syncPeachRecordsServiceSpy.mockResolvedValueOnce([{ to: ['proponent@example.com'] }] as never);
    sendPeachNotificationsServiceSpy.mockRejectedValueOnce(new Error('CHES down'));

    await expect(syncPeachToPcns()).resolves.toBeUndefined();
  });
});
