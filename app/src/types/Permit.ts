import { Prisma } from '@prisma/client';

const permit = Prisma.validator<Prisma.permitDefaultArgs>()({});

const permitWithType = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permitType: true }
});

const permitWithRelations = Prisma.validator<Prisma.permitDefaultArgs>()({
  include: { permitNote: true, permitType: true }
});

export type Permit = Prisma.permitGetPayload<typeof permit>;
export type PermitWithType = Prisma.permitGetPayload<typeof permitWithType>;
export type PermitWithRelations = Prisma.permitGetPayload<typeof permitWithRelations>;
