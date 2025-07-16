import { getLogger } from '../../components/log';
import prisma from '../../db/dataConnection';

export let electrificationProjectTypeCodes: string[] = [];
export let electrificationProjectCategoryCodes: string[] = [];
export let escalationTypeCodes: string[] = [];

const log = getLogger(module.filename);

/**
 * Pull the currently‑active codes from the DB and refresh
 * the in‑memory arrays.
 */
export async function refreshCodeCaches(): Promise<boolean> {
  try {
    electrificationProjectTypeCodes = (
      await prisma.electrification_project_type_code.findMany({
        where: { active: true },
        select: { code: true }
      })
    ).map((r) => r.code);

    electrificationProjectCategoryCodes = (
      await prisma.electrification_project_category_code.findMany({
        where: { active: true },
        select: { code: true }
      })
    ).map((r) => r.code);

    escalationTypeCodes = (
      await prisma.escalation_type_code.findMany({
        where: { active: true },
        select: { code: true }
      })
    ).map((r) => r.code);

    log.debug('Codes cache refreshed');
    return true;
  } catch (error) {
    log.error('Codes cache refresh failed', error);
    return false;
  }
}
