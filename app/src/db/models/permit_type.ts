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
      nameSubtype: input.nameSubtype,
      acronym: input.acronym,
      trackedInATS: input.trackedInATS,
      sourceSystem: input.sourceSystem,
      sourceSystemAcronym: input.sourceSystemAcronym
    };
  },

  fromPrismaModel(input: PrismaRelationPermitType): PermitType {
    return {
      permitTypeId: input.permitTypeId,
      agency: input.agency,
      division: input.division,
      branch: input.branch,
      businessDomain: input.businessDomain,
      type: input.type,
      family: input.family,
      name: input.name,
      nameSubtype: input.nameSubtype,
      acronym: input.acronym,
      trackedInATS: input.trackedInATS,
      sourceSystem: input.sourceSystem,
      sourceSystemAcronym: input.sourceSystemAcronym
    };
  }
};
