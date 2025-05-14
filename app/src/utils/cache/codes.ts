import prisma from '../../db/dataConnection';

export let electrificationProjectTypeCodes: string[] = [];
export let electrificationProjectCategoryCodes: string[] = [];

/**
 * Pull the currently‑active codes from the DB and refresh
 * the in‑memory arrays.
 */
export async function refreshCodeCaches(): Promise<void> {
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
}
