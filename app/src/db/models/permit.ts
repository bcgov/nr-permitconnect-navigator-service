import { Prisma } from '@prisma/client';

import permit_note from './permit_note';
import permit_type from './permit_type';

import type { Stamps } from '../stamps';
import type { Permit } from '../../types';

import { PermitTracking } from '../../types/PermitTracking';

// Define types
const _permit = Prisma.validator<Prisma.permitDefaultArgs>()({});
const _permitWithGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_type: true }
});
const _permitWithNotesTrackingGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_note: true, permit_type: true, permit_tracking: { include: { source_system_kind: true } } }
});
const _permitWithTrackingGraph = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permit_type: true, permit_tracking: { include: { source_system_kind: true } } }
});

type PrismaRelationPermit = Omit<Prisma.permitGetPayload<typeof _permit>, 'activity' | keyof Stamps>;
type PrismaGraphPermit = Prisma.permitGetPayload<typeof _permitWithGraph>;
type PrismaGraphPermitNotesTracking = Prisma.permitGetPayload<typeof _permitWithNotesTrackingGraph>;
type PrismaGraphPermitTracking = Prisma.permitGetPayload<typeof _permitWithTrackingGraph>;

export default {
  toPrismaModel(input: Permit): PrismaRelationPermit {
    return {
      permit_id: input.permitId,
      permit_type_id: input.permitTypeId,
      activity_id: input.activityId,
      issued_permit_id: input.issuedPermitId,
      auth_status: input.authStatus,
      needed: input.needed,
      status: input.status,
      submitted_date: input.submittedDate ? new Date(input.submittedDate) : null,
      adjudication_date: input.adjudicationDate ? new Date(input.adjudicationDate) : null,
      status_last_verified: input.statusLastVerified ? new Date(input.statusLastVerified) : null
    };
  },

  fromPrismaModel(input: PrismaGraphPermit): Permit {
    return {
      permitId: input.permit_id,
      permitTypeId: input.permit_type_id,
      activityId: input.activity_id,
      createdAt: input.created_at?.toISOString() ?? null,
      issuedPermitId: input.issued_permit_id,
      authStatus: input.auth_status,
      needed: input.needed,
      status: input.status,
      submittedDate: input.submitted_date?.toISOString() ?? null,
      adjudicationDate: input.adjudication_date?.toISOString() ?? null,
      statusLastVerified: input.status_last_verified?.toISOString() ?? null,
      updatedAt: input.updated_at?.toISOString() ?? null,
      updatedBy: input.updated_by,
      permitType: permit_type.fromPrismaModel(input.permit_type)
    };
  },

  fromPrismaModelWithNotesTracking(input: PrismaGraphPermitNotesTracking): Permit {
    const permit = this.fromPrismaModelWithTracking(input);
    if (permit && input.permit_note) {
      permit.permitNote = input.permit_note.map((note) => permit_note.fromPrismaModel(note));
    }

    return permit;
  },

  fromPrismaModelWithTracking(input: PrismaGraphPermitTracking): Permit {
    const permit = this.fromPrismaModel(input);
    if (permit && input.permit_tracking) {
      permit.permitTracking = input.permit_tracking.map((x) => {
        const { source_system_kind, ...rest } = x;
        return { sourceSystemKind: source_system_kind, ...rest } as PermitTracking;
      });
    }

    return permit;
  }
};
