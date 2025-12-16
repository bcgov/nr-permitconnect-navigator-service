import { syncPeachRecords } from './src/controllers/peach';
import { sendPermitUpdateNotifications } from './src/controllers/permit';
import { getLogger } from './src/utils/log';

const log = getLogger(module.filename);

async function syncPeachToPcns() {
  const started = Date.now();
  try {
    log.info('Peach Sync Job started');
    const updatedPermits = await syncPeachRecords();
    log.info(`Peach Sync Done in ${Date.now() - started} ms`);
    await sendPermitUpdateNotifications(updatedPermits);
    process.exit(0);
  } catch (err) {
    log.error('Peach Sync FAILED:', err);
    process.exit(1);
  }
}

void syncPeachToPcns();
