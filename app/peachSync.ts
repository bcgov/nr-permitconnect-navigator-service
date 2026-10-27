import { refreshCodeCaches } from './src/db/codes/cache.ts';
import { sendPeachNotificationsService, syncPeachRecordsService } from './src/services/peach.ts';
import { getLogger } from './src/utils/log.ts';
import { state } from './state.ts';

import type { Email } from '#types';

const log = getLogger(import.meta.filename);

export async function syncPeachToPcns() {
  if (!state.features.peach) return;

  const started = Date.now();
  log.info('PEACH sync job started');

  let emails: Email[];
  try {
    emails = await syncPeachRecordsService();

    log.info('PEACH sync completed', {
      durationMs: Date.now() - started,
      emailCount: emails.length
    });
  } catch (error) {
    log.error('PEACH sync FAILED during data sync', error);
    process.exitCode = 1;
    return;
  }

  if (emails.length === 0) return;

  try {
    await sendPeachNotificationsService(emails);
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

// Guards the auto-run so importing this module (e.g. from a test) doesn't trigger it
if (import.meta.main) {
  void main().catch((error) => {
    log.error('Fatal error in PEACH sync', error);
    process.exit(1);
  });
}
