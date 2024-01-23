import { Prisma } from '@prisma/client';

import type { IStamps } from '../../interfaces/IStamps';
import type { PermitType } from '../../types';

// Define types
const _permitType = Prisma.validator<Prisma.permit_typeDeleteArgs>()({});

type PrismaRelationPermitType = Omit<Prisma.permit_typeGetPayload<typeof _permitType>, keyof IStamps>;

export default {
  toPrismaModel(input: PermitType): PrismaRelationPermitType {
    return {
      permitTypeId: input.permitTypeId,
      agency: input.agency,
      division: input.division,
      branch: input.branch,
      businessDomain: input.businessDomain,
      type: input.type,
      family: input.family,
      name: input.name,
      name_subtype: input.nameSubtype,
      acronym: input.acronym,
      tracked_in_ats: input.trackedInATS,
      source_system: input.sourceSystem,
      source_system_acronym: input.sourceSystemAcronym
    };
  },

  fromPrismaModel(input: PrismaRelationPermitType | null): PermitType | null {
    if (!input) return null;

    return {
      permitTypeId: input.permitTypeId,
      agency: input.agency,
      division: input.division,
      branch: input.branch,
      businessDomain: input.businessDomain,
      type: input.type,
      family: input.family,
      name: input.name,
      nameSubtype: input.name_subtype,
      acronym: input.acronym,
      trackedInATS: input.tracked_in_ats,
      sourceSystem: input.source_system,
      sourceSystemAcronym: input.source_system_acronym
    };
  }
};
