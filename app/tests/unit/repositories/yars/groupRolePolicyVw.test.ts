import { prismaTxMock } from '#tests/__mocks__/prismaMock';
import { GroupRolePolicyVwRepository } from '#src/repositories/yars/groupRolePolicyVw';
import { Initiative } from '#src/utils/enums/application';

const makeRepo = () => new GroupRolePolicyVwRepository(prismaTxMock);

describe('GroupRolePolicyVwRepository', () => {
  const mockDbResult = [
    {
      groupId: 1,
      initiativeCode: Initiative.HOUSING,
      groupName: 'NAVIGATOR',
      roleName: 'TestRole',
      policyId: 100,
      resourceName: 'TestResource',
      actionName: 'TestAction'
    }
  ];

  describe('getGroupPolicyDetails', () => {
    it('queries by groupId, resource, action, and initiative and maps the result', async () => {
      prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getGroupPolicyDetails(1, 'TestResource', 'TestAction', Initiative.HOUSING);

      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
        where: {
          groupId: 1,
          resourceName: 'TestResource',
          actionName: 'TestAction',
          initiativeCode: Initiative.HOUSING
        }
      });

      expect(result).toStrictEqual([
        {
          groupId: 1,
          initiativeCode: Initiative.HOUSING,
          groupName: 'NAVIGATOR',
          roleName: 'TestRole',
          policyId: 100,
          resourceName: 'TestResource',
          actionName: 'TestAction'
        }
      ]);
    });

    it('queries successfully when initiative is not provided', async () => {
      prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce(mockDbResult as never);

      await makeRepo().getGroupPolicyDetails(1, 'TestResource', 'TestAction');

      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
        where: {
          groupId: 1,
          resourceName: 'TestResource',
          actionName: 'TestAction',
          initiativeCode: undefined
        }
      });
    });
  });

  describe('getPCNSGroupPolicyDetails', () => {
    it('queries using the PCNS initiative code and maps the result', async () => {
      prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getPCNSGroupPolicyDetails('NAVIGATOR', 'TestResource', 'TestAction');

      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
        where: {
          initiativeCode: Initiative.PCNS,
          groupName: 'NAVIGATOR',
          resourceName: 'TestResource',
          actionName: 'TestAction'
        }
      });

      expect(result).toStrictEqual([
        {
          groupId: 1,
          initiativeCode: Initiative.HOUSING,
          groupName: 'NAVIGATOR',
          roleName: 'TestRole',
          policyId: 100,
          resourceName: 'TestResource',
          actionName: 'TestAction'
        }
      ]);
    });
  });

  describe('getGroupPermissions', () => {
    it('queries by groupId and maps the result to permission objects', async () => {
      prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getGroupPermissions(1);

      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
        where: {
          groupId: 1
        }
      });

      expect(result).toStrictEqual([
        {
          group: 'NAVIGATOR',
          initiative: Initiative.HOUSING,
          resource: 'TestResource',
          action: 'TestAction'
        }
      ]);
    });
  });
});
