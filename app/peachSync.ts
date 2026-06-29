import { syncPeachRecords } from './src/domains/peach.ts';
import { sendPermitUpdateNotifications } from './src/domains/permit.ts';
import { refreshCodeCaches } from './src/db/codes/cache.ts';
import { unitOfWork } from './src/repository/unitOfWork.ts';
import { getLogger } from './src/utils/log.ts';
import { state } from './state.ts';

import type { UpdatedPermitWithNote } from './src/types';

const log = getLogger(module.filename);

async function syncPeachToPcns() {
  if (!state.features.peach) return;

  await unitOfWork.execute(
    async ({ electrificationProject, generalProject, housingProject, permit, permitNote, user }) => {
      const started = Date.now();
      let updatedPermitsWithNotes: UpdatedPermitWithNote[];

      log.info('PEACH sync job started');
      try {
        updatedPermitsWithNotes = await syncPeachRecords({ permit });

        log.info('PEACH sync completed', {
          durationMs: Date.now() - started,
          updatedCount: updatedPermitsWithNotes.length
        });
      } catch (error) {
        log.error('PEACH sync FAILED during data sync', error);
        process.exitCode = 1;
        return;
      }

      if (updatedPermitsWithNotes.length === 0) return;

      try {
        for (const permitWithNote of updatedPermitsWithNotes) {
          const { permit, note } = permitWithNote;
          await sendPermitUpdateNotifications(
            { electrificationProject, generalProject, housingProject, permitNote, user },
            permit,
            true,
            note
          );
        }
      } catch (error) {
        log.warn('PEACH sync completed but sending notifications failed', error);
      }
    }
  );
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
