import { syncPeachRecords } from './src/controllers/peach.ts';
import { sendPermitUpdateNotifications } from './src/controllers/permit.ts';
import { refreshCodeCaches } from './src/db/codes/cache.ts';
import { getLogger } from './src/utils/log.ts';
import { state } from './state.ts';

import type { Permit } from './src/types';

const log = getLogger(module.filename);

async function syncPeachToPcns() {
  if (!state.features.peach) return;

  const started = Date.now();
  let updatedPermits: Permit[];

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
    for (const permit of updatedPermits) {
      await sendPermitUpdateNotifications(permit, true);
    }
  } catch (error) {
    log.warn('PEACH sync completed but sending notifications failed', error);
  }
}

async function main() {
  const cacheRefreshSucceeded = await refreshCodeCaches();
  if (!cacheRefreshSucceeded) {
    log.error('Fatal error in PEACH sync: failed to refresh code caches');
    process.exitCode = 1;
    return;
  }
  await syncPeachToPcns();
}

void main().catch((error) => {
  log.error('Fatal error in PEACH sync', error);
  process.exit(1);
});
