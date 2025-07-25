import { Prisma } from '@prisma/client';

import type { Stamps } from '../stamps';
import type { PermitType } from '../../types';

// Define types
const _permitType = Prisma.validator<Prisma.permit_typeDeleteArgs>()({});

type PrismaRelationPermitType = Omit<Prisma.permit_typeGetPayload<typeof _permitType>, keyof Stamps>;

export default {
  toPrismaModel(input: PermitType): PrismaRelationPermitType {
    return {
      permit_type_id: input.permitTypeId,
      agency: input.agency,
      division: input.division,
      branch: input.branch,
      business_domain: input.businessDomain,
      type: input.type,
      family: input.family,
      name: input.name,
      name_subtype: input.nameSubtype,
      acronym: input.acronym,
      tracked_in_ats: input.trackedInATS,
      source_system: input.sourceSystem
    };
  },

  fromPrismaModel(input: PrismaRelationPermitType): PermitType {
    return {
      permitTypeId: input.permit_type_id,
      agency: input.agency,
      division: input.division,
      branch: input.branch,
      businessDomain: input.business_domain,
      type: input.type,
      family: input.family,
      name: input.name,
      nameSubtype: input.name_subtype,
      acronym: input.acronym,
      trackedInATS: input.tracked_in_ats,
      sourceSystem: input.source_system
    };
  }
};
