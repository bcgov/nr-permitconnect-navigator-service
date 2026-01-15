import { Prisma } from '@prisma/client';

import { Regex } from '../../utils/enums/application.ts';

const DATE_ONLY_REGEX = new RegExp(Regex.DATE_ONLY);
const DATE_FIELDS = ['submittedDate', 'decisionDate', 'statusLastVerified', 'statusLastChanged'];
const TIMETZ_REGEX = new RegExp(Regex.TIMETZ);
const TIME_FIELDS = ['submittedTime', 'decisionTime', 'statusLastVerifiedTime', 'statusLastChangedTime'];

// Date string "HH:MM:SS(.SSS)Z" into Date object w/ dummy time, gets dropped once inserted into db
function dateFromDateString(date: string | null | undefined): Date | null {
  if (!date) return null;
  return new Date(`${date}T00:00:00.000Z`);
}

// Time string "HH:MM:SS(.SSS)Z" into Date object w/ dummy date, gets dropped once inserted into db
function dateFromTimeString(time: string | null | undefined): Date | null {
  if (!time) return null;
  return new Date(`1970-01-01T${time}`);
}

// Date object into "YYYY-MM-DD"
function dateToDateString(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

// Date object into "HH:MM:SS(.SSS)Z"
function dateToTimeString(value: Date | null | undefined): string | null {
  if (!value) return null;
  return value.toISOString().slice(11);
}

// Make sure a string to date transformation hasn't already taken place
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePermitWriteData(data: any) {
  for (const field of DATE_FIELDS) {
    const value = data[field];
    if (typeof value === 'string' && DATE_ONLY_REGEX.test(value)) {
      data[field] = dateFromDateString(value);
    }
  }

  for (const field of TIME_FIELDS) {
    const value = data[field];
    if (typeof value === 'string' && TIMETZ_REGEX.test(value)) {
      data[field] = dateFromTimeString(value);
    }
  }

  return data;
}

const permitStatusDatesTransform = Prisma.defineExtension({
  query: {
    permit: {
      async create({ args, query }) {
        if (args.data) {
          normalizePermitWriteData(args.data);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data) {
          normalizePermitWriteData(args.data);
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create) {
          normalizePermitWriteData(args.create);
        }
        if (args.update) {
          normalizePermitWriteData(args.update);
        }
        return query(args);
      }
    }
  },
  result: {
    permit: {
      submittedDate: {
        needs: { submittedDate: true },
        compute(permit) {
          return dateToDateString(permit.submittedDate);
        }
      },
      decisionDate: {
        needs: { decisionDate: true },
        compute(permit) {
          return dateToDateString(permit.decisionDate);
        }
      },
      statusLastVerified: {
        needs: { statusLastVerified: true },
        compute(permit) {
          return dateToDateString(permit.statusLastVerified);
        }
      },
      statusLastChanged: {
        needs: { statusLastChanged: true },
        compute(permit) {
          return dateToDateString(permit.statusLastChanged);
        }
      },
      submittedTime: {
        needs: { submittedTime: true },
        compute(permit) {
          return dateToTimeString(permit.submittedTime);
        }
      },
      decisionTime: {
        needs: { decisionTime: true },
        compute(permit) {
          return dateToTimeString(permit.decisionTime);
        }
      },
      statusLastVerifiedTime: {
        needs: { statusLastVerifiedTime: true },
        compute(permit) {
          return dateToTimeString(permit.statusLastVerifiedTime);
        }
      },
      statusLastChangedTime: {
        needs: { statusLastChangedTime: true },
        compute(permit) {
          return dateToTimeString(permit.statusLastChangedTime);
        }
      }
    }
  }
});

export default permitStatusDatesTransform;
