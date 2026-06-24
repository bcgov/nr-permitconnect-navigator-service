import { Prisma } from '@prisma/client';

import { BaseRepository } from '../base.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
const policy_attribute = Prisma.validator<Prisma.policy_attributeDefaultArgs>()({});
type PolicyAttributeBase = Prisma.policy_attributeGetPayload<typeof policy_attribute>;

export class PolicyAttributeRepository extends BaseRepository<
  PolicyAttributeBase,
  Prisma.policy_attributeCreateInput,
  Prisma.policy_attributeUpdateInput,
  Prisma.policy_attributeWhereUniqueInput,
  Prisma.policy_attributeWhereInput,
  Prisma.policy_attributeFindUniqueArgs,
  Prisma.policy_attributeFindFirstArgs,
  Prisma.policy_attributeFindManyArgs,
  PrismaTransactionClient['policy_attribute']
> {
  constructor(tx: PrismaTransactionClient, principal: string) {
    super(tx.policy_attribute, principal);
  }

  /**
   * Gets a list of attributes associated with the given policyId
   * @param policyId Policy ID to search
   * @returns A Promise that resolves to an array of policy attributes
   */
  async getPolicyAttributes(policyId: number) {
    const result = await this.model.findMany({
      where: {
        policyId
      },
      include: {
        attribute: {
          include: {
            attributeGroup: true
          }
        }
      }
    });

    return result.map((x) => ({
      attributeId: x.attribute.attributeId,
      attributeName: x.attribute.name,
      groupId: x.attribute.attributeGroup.map((x) => x.groupId)
    }));
  }
}
