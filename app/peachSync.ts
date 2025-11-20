import { syncPeachRecords } from './src/controllers/peach';
import { getLogger } from './src/components/log';

const log = getLogger(module.filename);

async function syncPeachToPcns() {
  const started = Date.now();
  try {
    log.info('Peach Sync Job started');
    await syncPeachRecords();
    log.info(`Peach Sync Done in ${Date.now() - started} ms`);
    process.exit(0);
  } catch (err) {
    log.error('Peach Sync FAILED:', err);
    process.exit(1);
  }
}

void syncPeachToPcns();
