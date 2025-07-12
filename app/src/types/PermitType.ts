import { Prisma } from '@prisma/client';

const permitType = Prisma.validator<Prisma.permit_typeDefaultArgs>()({});

export type PermitType = Prisma.permit_typeGetPayload<typeof permitType>;
