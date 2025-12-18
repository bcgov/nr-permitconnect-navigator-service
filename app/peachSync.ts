import { syncPeachRecords } from './src/controllers/peach';
import { sendPermitUpdateNotifications } from './src/controllers/permit';
import { getLogger } from './src/utils/log';

import type { Permit } from './src/types';

const log = getLogger(module.filename);

async function syncPeachToPcns() {
  const started = Date.now();
  let updatedPermits: Permit[] = [];

  log.info('PEACH sync job started');
  try {
    updatedPermits = await syncPeachRecords();

    log.info('PEACH sync completed', {
      durationMs: Date.now() - started,
      updatedCount: updatedPermits.length
    });
  } catch (error) {
    log.error('PEACH sync FAILED during data sync', error);
    process.exitCode = 1;
    return;
  }

  if (updatedPermits.length === 0) return;

  try {
    await sendPermitUpdateNotifications(updatedPermits);
  } catch (error) {
    log.warn('PEACH sync completed but sending notifications failed', error);
  }
}

void syncPeachToPcns();
