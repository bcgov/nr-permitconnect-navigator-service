import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import * as yarsService from '../../../src/services/yars.ts';
import { GroupName, Initiative } from '../../../src/utils/enums/application.ts';

const createTimeStamps = (overrides = {}) => ({
  createdBy: null,
  createdAt: null,
  updatedBy: null,
  updatedAt: null,
  deletedBy: null,
  deletedAt: null,
  ...overrides
});

const createMockGroup = (overrides = {}) => ({
  groupId: 1,
  name: GroupName.NAVIGATOR,
  label: 'Group Label',
  initiativeId: 'init-1',
  ...createTimeStamps(),
  ...overrides
});

const createMockInitiative = (overrides = {}) => ({
  initiativeId: 'init-1',
  code: Initiative.HOUSING,
  label: 'Housing Initiative',
  ...createTimeStamps(),

  ...overrides
});

const createMockGlobalInitiative = (overrides = {}) => ({
  initiativeId: 'init-global',
  code: Initiative.PCNS,
  label: 'Global Initiative',
  ...createTimeStamps(),
  ...overrides
});

const createMockSubjectGroup = (overrides = {}) => ({
  sub: 'sub',
  groupId: 1,
  ...createTimeStamps(),
  ...overrides
});

const createMockGroupRolePolicy = (overrides = {}) => ({
  rowNumber: BigInt(1),
  groupId: 1,
  initiativeCode: Initiative.HOUSING,
  groupName: GroupName.NAVIGATOR,
  roleName: 'role-name',
  policyId: 123,
  resourceName: 'resource',
  actionName: 'action',
  attributeName: null,
  ...overrides
});

const createMockPolicyAttribute = (overrides = {}) => ({
  policyId: 1,
  attributeId: 1,
  ...createTimeStamps(),
  attribute: {
    attributeId: 1,
    name: 'attr',
    description: 'attr-desc',
    ...createTimeStamps(),
    attributeGroup: [createMockGroup()]
  },
  ...overrides
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('assignGroup', () => {
  it('calls subject_group.create and returns result', async () => {
    prismaTxMock.group.findFirstOrThrow.mockResolvedValueOnce(createMockGroup());
    prismaTxMock.subject_group.count.mockResolvedValueOnce(0);
    prismaTxMock.subject_group.create.mockResolvedValueOnce(createMockSubjectGroup());

    const response = await yarsService.assignGroup(prismaTxMock, 'sub', 1);

    expect(prismaTxMock.subject_group.create).toHaveBeenCalledTimes(1);
    expect(prismaTxMock.subject_group.create).toHaveBeenCalledWith({
      data: {
        sub: 'sub',
        groupId: 1
      }
    });
    expect(response).toStrictEqual({ sub: 'sub', roleId: 1 });
  });

  it('returns group if already assigned', async () => {
    prismaTxMock.group.findFirstOrThrow.mockResolvedValueOnce(createMockGroup());
    prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

    const response = await yarsService.assignGroup(prismaTxMock, 'sub', 1);

    expect(prismaTxMock.subject_group.create).not.toHaveBeenCalled();
    expect(response).toStrictEqual({ sub: 'sub', roleId: 1 });
  });
});

describe('getCorrespondingGlobalGroup', () => {
  it('returns corresponding global group', async () => {
    prismaTxMock.group.findFirstOrThrow.mockResolvedValueOnce(createMockGroup());
    prismaTxMock.group.findFirstOrThrow.mockResolvedValueOnce(
      createMockGroup({
        groupId: 99,
        name: 'global-group',
        label: 'Global Label',
        initiativeId: 'init-global'
      })
    );

    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce(createMockGlobalInitiative());

    const response = await yarsService.getCorrespondingGlobalGroup(prismaTxMock, 1);

    expect(prismaTxMock.group.findFirstOrThrow).toHaveBeenNthCalledWith(1, {
      where: { groupId: 1 }
    });
    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledWith({
      where: { code: Initiative.PCNS }
    });
    expect(prismaTxMock.group.findFirstOrThrow).toHaveBeenNthCalledWith(2, {
      where: {
        initiativeId: 'init-global',
        name: GroupName.NAVIGATOR
      }
    });

    expect(response).toStrictEqual({
      initiativeCode: Initiative.PCNS,
      initiativeId: 'init-global',
      groupId: 99,
      name: 'global-group',
      label: 'Global Label'
    });
  });
});

describe('getSubjectGroups', () => {
  it('returns mapped subject groups', async () => {
    prismaTxMock.subject_group.findMany.mockResolvedValueOnce([
      {
        ...createMockSubjectGroup({ group: createMockGroup({ initiative: createMockInitiative() }) })
      }
    ]);

    const response = await yarsService.getSubjectGroups(prismaTxMock, 'sub');

    expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledWith({
      where: { sub: 'sub' },
      include: {
        group: {
          include: {
            initiative: true
          }
        }
      }
    });

    expect(response).toStrictEqual([
      {
        initiativeCode: Initiative.HOUSING,
        initiativeId: 'init-1',
        groupId: 1,
        name: GroupName.NAVIGATOR,
        label: 'Group Label'
      }
    ]);
  });
});

describe('getSubjectInitiatives', () => {
  it('returns mapped initiatives excluding PCNS', async () => {
    prismaTxMock.subject_group.findMany.mockResolvedValueOnce([
      {
        ...createMockSubjectGroup({ group: createMockGroup({ initiative: createMockInitiative() }) })
      }
    ]);

    const response = await yarsService.getSubjectInitiatives(prismaTxMock, 'sub');

    expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledWith({
      select: {
        group: {
          select: {
            initiativeId: true,
            initiative: {
              select: {
                code: true
              }
            }
          }
        }
      },
      where: {
        sub: 'sub',
        NOT: {
          group: {
            initiative: {
              code: Initiative.PCNS
            }
          }
        }
      }
    });

    expect(response).toStrictEqual([
      {
        code: Initiative.HOUSING,
        initiativeId: 'init-1'
      }
    ]);
  });
});

describe('getGroupPolicyDetails', () => {
  it('returns mapped policy details with initiative filter', async () => {
    prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce([createMockGroupRolePolicy()]);

    const response = await yarsService.getGroupPolicyDetails(prismaTxMock, 1, 'resource', 'action', Initiative.HOUSING);

    expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
      where: {
        groupId: 1,
        resourceName: 'resource',
        actionName: 'action',
        initiativeCode: Initiative.HOUSING
      }
    });
    expect(response).toStrictEqual([
      {
        groupId: 1,
        initiativeCode: Initiative.HOUSING,
        groupName: GroupName.NAVIGATOR,
        roleName: 'role-name',
        policyId: 123,
        resourceName: 'resource',
        actionName: 'action'
      }
    ]);
  });
});

describe('getPCNSGroupPolicyDetails', () => {
  it('returns mapped policy details for PCNS initiative', async () => {
    prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce([createMockGroupRolePolicy()]);

    const response = await yarsService.getPCNSGroupPolicyDetails(
      prismaTxMock,
      GroupName.NAVIGATOR,
      'resource',
      'action'
    );

    expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
      where: {
        groupName: GroupName.NAVIGATOR,
        resourceName: 'resource',
        actionName: 'action',
        initiativeCode: Initiative.PCNS
      }
    });
    expect(response).toStrictEqual([
      {
        groupId: 1,
        initiativeCode: Initiative.HOUSING,
        groupName: GroupName.NAVIGATOR,
        roleName: 'role-name',
        policyId: 123,
        resourceName: 'resource',
        actionName: 'action'
      }
    ]);
  });
});

describe('getGroupPermissions', () => {
  it('returns mapped group permissions', async () => {
    prismaTxMock.group_role_policy_vw.findMany.mockResolvedValueOnce([createMockGroupRolePolicy()]);

    const response = await yarsService.getGroupPermissions(prismaTxMock, 1);

    expect(prismaTxMock.group_role_policy_vw.findMany).toHaveBeenCalledWith({
      where: {
        groupId: 1
      }
    });
    expect(response).toStrictEqual([
      {
        group: GroupName.NAVIGATOR,
        initiative: Initiative.HOUSING,
        resource: 'resource',
        action: 'action'
      }
    ]);
  });
});

describe('getGroups', () => {
  it('returns mapped groups for the initiative', async () => {
    prismaTxMock.initiative.findFirstOrThrow.mockResolvedValueOnce(createMockInitiative());
    prismaTxMock.group.findMany.mockResolvedValueOnce([createMockGroup()]);

    const response = await yarsService.getGroups(prismaTxMock, Initiative.HOUSING);

    expect(prismaTxMock.initiative.findFirstOrThrow).toHaveBeenCalledWith({
      where: {
        code: Initiative.HOUSING
      }
    });
    expect(prismaTxMock.group.findMany).toHaveBeenCalledWith({
      where: {
        initiativeId: 'init-1'
      }
    });
    expect(response).toStrictEqual([
      {
        groupId: 1,
        initiativeCode: Initiative.HOUSING,
        initiativeId: 'init-1',
        name: GroupName.NAVIGATOR,
        label: 'Group Label'
      }
    ]);
  });
});

describe('getPolicyAttributes', () => {
  it('returns mapped attributes for the policy', async () => {
    prismaTxMock.policy_attribute.findMany.mockResolvedValueOnce([createMockPolicyAttribute()]);

    const response = await yarsService.getPolicyAttributes(prismaTxMock, 1);

    expect(prismaTxMock.policy_attribute.findMany).toHaveBeenCalledWith({
      where: {
        policyId: 1
      },
      include: {
        attribute: {
          include: {
            attributeGroup: true
          }
        }
      }
    });

    expect(response).toStrictEqual([
      {
        attributeId: 1,
        attributeName: 'attr',
        groupId: [1]
      }
    ]);
  });
});

describe('removeGroup', () => {
  it('calls subject_group.delete and returns deleted group', async () => {
    prismaTxMock.subject_group.delete.mockResolvedValueOnce(createMockSubjectGroup());

    const response = await yarsService.removeGroup(prismaTxMock, 'sub', 1);

    expect(prismaTxMock.subject_group.delete).toHaveBeenCalledWith({
      where: {
        sub_groupId: {
          sub: 'sub',
          groupId: 1
        }
      }
    });

    expect(response).toStrictEqual({ sub: 'sub', roleId: 1 });
  });
});

describe('subjectHasGroup', () => {
  it('calls subject_group.count and returns true if count > 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

    const response = await yarsService.subjectHasGroup(prismaTxMock, 'sub', 1);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        groupId: 1
      }
    });

    expect(response).toStrictEqual(true);
  });

  it('calls subject_group.count and returns false if count <= 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(0);

    const response = await yarsService.subjectHasGroup(prismaTxMock, 'sub', 1);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        groupId: 1
      }
    });

    expect(response).toStrictEqual(false);
  });
});

describe('subjectHasGroupName', () => {
  it('calls subject_group.count and returns true if count > 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

    const response = await yarsService.subjectHasGroupName(prismaTxMock, 'sub', GroupName.NAVIGATOR);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        group: {
          name: GroupName.NAVIGATOR
        },
        NOT: {
          group: {
            initiative: {
              code: Initiative.PCNS
            }
          }
        }
      }
    });

    expect(response).toStrictEqual(true);
  });

  it('calls subject_group.count and returns false if count <= 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(0);

    const response = await yarsService.subjectHasGroupName(prismaTxMock, 'sub', GroupName.NAVIGATOR);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        group: {
          name: GroupName.NAVIGATOR
        },
        NOT: {
          group: {
            initiative: {
              code: Initiative.PCNS
            }
          }
        }
      }
    });

    expect(response).toStrictEqual(false);
  });
});

describe('subjectHasInitiativeGroupName', () => {
  it('calls subject_group.count and returns true if count > 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

    const response = await yarsService.subjectHasInitiativeGroupName(prismaTxMock, 'sub', Initiative.HOUSING, [
      GroupName.NAVIGATOR
    ]);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        group: {
          name: { in: [GroupName.NAVIGATOR] },
          initiative: { code: Initiative.HOUSING }
        }
      }
    });

    expect(response).toStrictEqual(true);
  });

  it('calls subject_group.count and returns false if count <= 0', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(0);

    const response = await yarsService.subjectHasInitiativeGroupName(prismaTxMock, 'sub', Initiative.HOUSING, [
      GroupName.NAVIGATOR
    ]);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        group: {
          name: { in: [GroupName.NAVIGATOR] },
          initiative: { code: Initiative.HOUSING }
        }
      }
    });

    expect(response).toStrictEqual(false);
  });

  it('filters out undefined', async () => {
    prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

    await yarsService.subjectHasInitiativeGroupName(prismaTxMock, 'sub', Initiative.HOUSING, [
      GroupName.NAVIGATOR,
      undefined
    ]);

    expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
      where: {
        sub: 'sub',
        group: {
          name: { in: [GroupName.NAVIGATOR] },
          initiative: { code: Initiative.HOUSING }
        }
      }
    });
  });
});
