import { ReadableRepository } from '../readable.ts';

import type { PrismaTransactionClient } from '../../db/database.ts';
import { Initiative } from '../../utils/enums/application.ts';

export class GroupRolePolicyVwRepository extends ReadableRepository<PrismaTransactionClient['group_role_policy_vw']> {
  constructor(tx: PrismaTransactionClient) {
    super(tx.group_role_policy_vw);
  }

  /**
   * Gets a list of group/role/policy/resource/action matching the given parameters
   * @param groupId Group ID to match on
   * @param resourceName Resource name to match on
   * @param actionName Action name to match on
   * @param initiative Optional initiative code to match on
   * @returns A Promise that resolves into an array of group policy details
   */
  async getGroupPolicyDetails(groupId: number, resourceName: string, actionName: string, initiative?: Initiative) {
    const result = await this.model.findMany({
      where: {
        groupId: groupId,
        resourceName: resourceName,
        actionName: actionName,
        initiativeCode: initiative
      }
    });

    return result.map((x) => ({
      groupId: x.groupId,
      initiativeCode: x.initiativeCode,
      groupName: x.groupName,
      roleName: x.roleName,
      policyId: x.policyId,
      resourceName: x.resourceName,
      actionName: x.actionName
    }));
  }

  /**
   * Gets a list of group/role/policy/resource/action matching the given parameters for the PCNS initiative
   * @param groupName Group name to match on
   * @param resourceName Resource name to match on
   * @param actionName Action name to match on
   * @returns A Promise that resolves into an array of group policy details
   */
  async getPCNSGroupPolicyDetails(groupName: string, resourceName: string, actionName: string) {
    const result = await this.model.findMany({
      where: {
        initiativeCode: Initiative.PCNS,
        groupName: groupName,
        resourceName: resourceName,
        actionName: actionName
      }
    });

    return result.map((x) => ({
      groupId: x.groupId,
      initiativeCode: x.initiativeCode,
      groupName: x.groupName,
      roleName: x.roleName,
      policyId: x.policyId,
      resourceName: x.resourceName,
      actionName: x.actionName
    }));
  }

  /**
   * Gets a list of resource/actions associated with the given groupId
   * @param groupId Group ID to search
   * @returns A Promise that resolves to array of permissions
   */
  async getGroupPermissions(groupId: number) {
    const result = await this.model.findMany({
      where: {
        groupId
      }
    });

    return result.map((x) => ({
      group: x.groupName,
      initiative: x.initiativeCode,
      resource: x.resourceName,
      action: x.actionName
    }));
  }
}
