import { randomUUID } from 'node:crypto';
import config from 'config';

import prisma from '#src/db/database';
import { HousingProjectRepository } from '#src/repositories/housingProject';
import { PermitRepository } from '#src/repositories/permit';
import { Initiative } from '#src/utils/enums/application';
import { PermitNeeded } from '#src/utils/enums/permit';

import type { Prisma } from '#prismaClient';
import type { PrismaTransactionClient } from '#src/db/database';

/* eslint-disable no-console -- CLI report output */

// Verifies the filterDeleted extension against a real database.
// Seeds fixtures, runs every check, then always rolls back. Run from app/: npm run verify:softdelete

class Rollback extends Error {}

const PRINCIPAL = 'verifySoftDelete';
const deleted = { deletedAt: new Date(), deletedBy: PRINCIPAL };

const U1 = randomUUID(); // the proponent every check is scoped to
const U2 = randomUUID();

const C1 = randomUUID(); // U1, live
const C2 = randomUUID(); // U2, live
const C3 = randomUUID(); // U1, soft deleted ("Ghostly")

const A1 = 'SDCHK001'; // SD Alpha, U1 PRIMARY
const A2 = 'SDCHK002'; // SD Bravo, U2 PRIMARY + removed U1 MEMBER link
const A3 = 'SDCHK003'; // SD Charlie, deleted U1 contact PRIMARY
const A4 = 'SDCHK004'; // SD Delta (deleted project), U2 PRIMARY + U1 MEMBER
const A5 = 'SDCHK005'; // no project, no contacts
const A6 = 'SDCHK006'; // SD Echo, U1 PRIMARY
const A7 = 'SDCHK007'; // SD Foxtrot, U1 ADMIN
const ACTIVITIES = [A1, A2, A3, A4, A5, A6, A7];

const PM1 = randomUUID(); // A1, needed Yes, tracking SDTRK-LIVE
const PM2 = randomUUID(); // A1, needed Yes, deleted tracking SDTRK-GONE
const PM3 = randomUUID(); // A1, needed Yes, soft deleted
const PM4 = randomUUID(); // A4 (deleted project), needed Yes
const PM5 = randomUUID(); // A1, needed No

const results: { name: string; ok: boolean; detail: string }[] = [];

async function check(name: string, run: () => Promise<unknown[]>, expected: unknown[], ordered = false) {
  const normalize = (values: unknown[]) => {
    const strings = values.map(String);
    return ordered ? strings : strings.sort();
  };

  try {
    const actual = normalize(await run());
    const wanted = normalize(expected);
    const ok = actual.length === wanted.length && actual.every((value, i) => value === wanted[i]);
    results.push({ name, ok, detail: ok ? '' : `expected [${wanted.join(', ')}] got [${actual.join(', ')}]` });
  } catch (error) {
    const lines = (error as Error).message.split('\n').filter((line) => line.trim());
    results.push({ name, ok: false, detail: `threw: ${lines.at(-1)?.trim()}` });
  }
}

async function seed(tx: PrismaTransactionClient) {
  const { initiativeId } = await tx.initiative.findFirstOrThrow({ where: { code: Initiative.HOUSING } });
  const { permitTypeId } = await tx.permit_type.findFirstOrThrow();
  const { code: stage } = await tx.permit_stage_code.findFirstOrThrow();
  const { code: state } = await tx.permit_state_code.findFirstOrThrow();

  await tx.user.createMany({
    data: [
      { userId: U1, sub: `${PRINCIPAL}-${U1}` },
      { userId: U2, sub: `${PRINCIPAL}-${U2}` }
    ]
  });

  await tx.contact.createMany({
    data: [
      { contactId: C1, userId: U1, firstName: 'Alice', lastName: 'Proponent' },
      { contactId: C2, userId: U2, firstName: 'Bob', lastName: 'Other' },
      { contactId: C3, userId: U1, firstName: 'Ghostly', lastName: 'Removed', ...deleted }
    ]
  });

  await tx.activity.createMany({ data: ACTIVITIES.map((activityId) => ({ activityId, initiativeId })) });

  await tx.activity_contact.createMany({
    data: [
      { activityId: A1, contactId: C1, role: 'PRIMARY' },
      { activityId: A2, contactId: C2, role: 'PRIMARY' },
      { activityId: A2, contactId: C1, role: 'MEMBER', ...deleted },
      { activityId: A3, contactId: C3, role: 'PRIMARY' },
      { activityId: A4, contactId: C2, role: 'PRIMARY' },
      { activityId: A4, contactId: C1, role: 'MEMBER' },
      { activityId: A6, contactId: C1, role: 'PRIMARY' },
      { activityId: A7, contactId: C1, role: 'ADMIN' }
    ]
  });

  const project = (activityId: string, projectName: string, extra = {}) => ({
    housingProjectId: randomUUID(),
    activityId,
    projectName,
    submittedAt: new Date(),
    submittedBy: PRINCIPAL,
    ...extra
  });

  await tx.housing_project.createMany({
    data: [
      project(A1, 'SD Alpha'),
      project(A2, 'SD Bravo'),
      project(A3, 'SD Charlie'),
      project(A4, 'SD Delta', deleted),
      project(A6, 'SD Echo'),
      project(A7, 'SD Foxtrot')
    ]
  });

  const permit = (permitId: string, activityId: string, needed: PermitNeeded, extra = {}) => ({
    permitId,
    activityId,
    permitTypeId,
    stage,
    state,
    needed,
    ...extra
  });

  await tx.permit.createMany({
    data: [
      permit(PM1, A1, PermitNeeded.YES),
      permit(PM2, A1, PermitNeeded.YES),
      permit(PM3, A1, PermitNeeded.YES, deleted),
      permit(PM4, A4, PermitNeeded.YES),
      permit(PM5, A1, PermitNeeded.NO)
    ]
  });

  await tx.permit_tracking.createMany({
    data: [
      { permitId: PM1, trackingId: 'SDTRK-LIVE' },
      { permitId: PM2, trackingId: 'SDTRK-GONE', ...deleted }
    ]
  });
}

async function runChecks(tx: PrismaTransactionClient) {
  const inFixture = { activityId: { in: ACTIVITIES } };
  const u1Link = { activityContact: { some: { contact: { userId: U1 } } } };

  const activityIds = async (where: Prisma.activityWhereInput) =>
    (await tx.activity.findMany({ where: { ...inFixture, ...where }, select: { activityId: true } })).map(
      (a) => a.activityId
    );

  const linkActivityIds = async (where: Prisma.activity_contactWhereInput) =>
    (await tx.activity_contact.findMany({ where: { ...inFixture, ...where }, select: { activityId: true } })).map(
      (l) => l.activityId
    );

  // List relations
  await check('some: skips removed link (002) and deleted contact (003)', () => activityIds(u1Link), [A1, A4, A6, A7]);
  await check(
    'none: only live links to live contacts count',
    () => activityIds({ activityContact: { none: { contact: { userId: U1 } } } }),
    [A2, A3, A5]
  );
  await check(
    'every: ignores the removed MEMBER link on 002',
    () => activityIds({ activityContact: { every: { role: 'PRIMARY' } } }),
    [A1, A2, A3, A5, A6]
  );
  await check(
    'every {}: matches all (Prisma NOT {} semantics)',
    () => activityIds({ activityContact: { every: {} } }),
    [...ACTIVITIES]
  );

  // To-one relations
  await check('to-one direct: skips deleted contact', () => linkActivityIds({ contact: { userId: U1 } }), [
    A1,
    A4,
    A6,
    A7
  ]);
  await check('to-one is: skips deleted contact', () => linkActivityIds({ contact: { is: { userId: U1 } } }), [
    A1,
    A4,
    A6,
    A7
  ]);
  await check('isNot: null requires a live project', () => activityIds({ housingProject: { isNot: null } }), [
    A1,
    A2,
    A3,
    A6,
    A7
  ]);
  await check(
    'is: null matches no project (005) and deleted project (004)',
    () => activityIds({ housingProject: { is: null } }),
    [A4, A5]
  );
  await check('relation: null behaves like is: null', () => activityIds({ housingProject: null }), [A4, A5]);
  await check(
    'isNot filter includes no project and deleted project',
    () => activityIds({ housingProject: { isNot: { projectName: 'SD Alpha' } } }),
    [A2, A3, A4, A5, A6, A7]
  );

  // Logical operators
  await check('NOT walks into relation filters', () => activityIds({ NOT: u1Link }), [A2, A3, A5]);
  await check('OR walks into relation filters', () => activityIds({ OR: [u1Link, { housingProject: { is: null } }] }), [
    A1,
    A4,
    A5,
    A6,
    A7
  ]);

  // Nested includes
  await check(
    'include where: walks relation filter (003 contact deleted)',
    async () =>
      (
        await tx.activity.findUniqueOrThrow({
          where: { activityId: A3 },
          include: { activityContact: { where: { contact: { userId: U1 } } } }
        })
      ).activityContact.map((l) => l.contactId),
    []
  );
  await check(
    'include: skips removed link on 002',
    async () =>
      (
        await tx.activity.findUniqueOrThrow({ where: { activityId: A2 }, include: { activityContact: true } })
      ).activityContact.map((l) => l.contactId),
    [C2]
  );

  // _count
  await check(
    '_count with where: skips deleted permit',
    async () => [
      (
        await tx.activity.findUniqueOrThrow({
          where: { activityId: A1 },
          include: { _count: { select: { permit: { where: { needed: PermitNeeded.YES } } } } }
        })
      )._count.permit
    ],
    [2]
  );
  await check(
    '_count: true skips deleted permit',
    async () => [
      (await tx.activity.findUniqueOrThrow({ where: { activityId: A1 }, include: { _count: true } }))._count.permit
    ],
    [3]
  );
  await check(
    '_count select: skips removed link on 002',
    async () => [
      (
        await tx.activity.findUniqueOrThrow({
          where: { activityId: A2 },
          include: { _count: { select: { activityContact: true } } }
        })
      )._count.activityContact
    ],
    [1]
  );

  // includeDeleted
  await check(
    'includeDeleted bypasses relation filters too',
    async () =>
      (
        await tx.activity.findMany({
          where: { ...inFixture, ...u1Link },
          includeDeleted: true
        } as Prisma.activityFindManyArgs)
      ).map((a) => a.activityId),
    [A1, A2, A3, A4, A6, A7]
  );

  const permitRepo = new PermitRepository(tx, PRINCIPAL);

  // domains/activity.ts relies on this to find permits it just soft deleted
  await check(
    'repository includeDeleted returns soft deleted rows',
    async () =>
      (
        await permitRepo.findMany({ where: { activityId: A1 }, select: { permitId: true } }, { includeDeleted: true })
      ).map((p) => p.permitId),
    [PM1, PM2, PM3, PM5]
  );

  // Housing project search
  const housing = new HousingProjectRepository(tx, PRINCIPAL);
  const base = { activityId: ACTIVITIES, skip: 0, take: 2, sortField: 'projectName', sortOrder: '1' as const };
  const names = (result: { projects: { projectName?: string | null }[] }) => result.projects.map((p) => p.projectName);

  await check(
    'scoped search: total counts visible projects only',
    async () => [(await housing.search(base, U1)).totalRecords],
    [3]
  );
  await check(
    'scoped search: page 1',
    async () => names(await housing.search(base, U1)),
    ['SD Alpha', 'SD Echo'],
    true
  );
  await check(
    'scoped search: page 2',
    async () => names(await housing.search({ ...base, skip: 2 }, U1)),
    ['SD Foxtrot'],
    true
  );
  await check('unscoped search: all live projects', async () => names(await housing.search({ ...base, take: 10 })), [
    'SD Alpha',
    'SD Bravo',
    'SD Charlie',
    'SD Echo',
    'SD Foxtrot'
  ]);
  await check(
    'searchTag: skips deleted contact',
    async () => names(await housing.search({ ...base, take: 10, searchTag: 'Ghostly' })),
    []
  );
  await check(
    'searchTag: skips removed link',
    async () => names(await housing.search({ ...base, take: 10, searchTag: 'Alice' })),
    ['SD Alpha', 'SD Echo', 'SD Foxtrot']
  );

  // Permit search
  const permitIds = async (searchTag: string) =>
    (await permitRepo.search(Initiative.HOUSING, { skip: 0, take: 10, searchTag })).permits.map((p) => p.permitId);

  await check('permit search: skips permits of a deleted project', () => permitIds(A4), []);
  await check('permit search: skips deleted permits', () => permitIds(A1), [PM1, PM2, PM5]);
  await check('permit search: skips deleted tracking', () => permitIds('SDTRK-GONE'), []);
  await check('permit search: finds live tracking', () => permitIds('SDTRK-LIVE'), [PM1]);
}

async function main() {
  console.log(
    `Target: ${config.get<string>('server.db.host')}/${config.get<string>('server.db.database')} (rolled back)\n`
  );

  try {
    await prisma.$transaction(
      async (tx) => {
        await seed(tx);
        await runChecks(tx);
        throw new Rollback();
      },
      { timeout: 60_000 }
    );
  } catch (error) {
    if (!(error instanceof Rollback)) throw error;
  }

  for (const { name, ok, detail } of results)
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? `\n      ${detail}` : ''}`);

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed} passed, ${failed} failed`);
  process.exitCode = failed ? 1 : 0;
}

void main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
