import { WritableRepository } from '../writable.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';

export class PolicyAttributeRepository extends WritableRepository<PrismaTransactionClient['policy_attribute']> {
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
