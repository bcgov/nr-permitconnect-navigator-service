import { prismaTxMock } from '../../../__mocks__/prismaMock.ts';
import { SubjectGroupRepository } from '../../../../src/repositories/yars/subjectGroup.ts';
import { GroupName, Initiative } from '../../../../src/utils/enums/application.ts';

const makeRepo = () => new SubjectGroupRepository(prismaTxMock, 'principal-id');

describe('SubjectGroupRepository', () => {
  const mockSub = 'user-sub-123';

  describe('getSubjectGroups', () => {
    it('queries by sub, includes nested group and initiative, and maps the result', async () => {
      const mockDbResult = [
        {
          groupId: 1,
          group: {
            initiativeId: 'init-1',
            name: GroupName.NAVIGATOR,
            label: 'Navigator',
            initiative: {
              code: Initiative.HOUSING
            }
          }
        }
      ];

      prismaTxMock.subject_group.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getSubjectGroups(mockSub);

      expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledWith({
        where: { sub: mockSub },
        include: {
          group: {
            include: { initiative: true }
          }
        }
      });

      expect(result).toStrictEqual([
        {
          initiativeCode: Initiative.HOUSING,
          initiativeId: 'init-1',
          groupId: 1,
          name: GroupName.NAVIGATOR,
          label: 'Navigator'
        }
      ]);
    });
  });

  describe('getSubjectInitiatives', () => {
    it('queries by sub excluding PCNS initiative and maps the result', async () => {
      const mockDbResult = [
        {
          group: {
            initiativeId: 'init-1',
            initiative: {
              code: Initiative.HOUSING
            }
          }
        }
      ];

      prismaTxMock.subject_group.findMany.mockResolvedValueOnce(mockDbResult as never);

      const result = await makeRepo().getSubjectInitiatives(mockSub);

      expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledTimes(1);
      expect(prismaTxMock.subject_group.findMany).toHaveBeenCalledWith({
        select: {
          group: {
            select: {
              initiativeId: true,
              initiative: { select: { code: true } }
            }
          }
        },
        where: {
          sub: mockSub,
          NOT: {
            group: { initiative: { code: Initiative.PCNS } }
          }
        }
      });

      expect(result).toStrictEqual([
        {
          code: Initiative.HOUSING,
          initiativeId: 'init-1'
        }
      ]);
    });
  });

  describe('subjectHasGroup', () => {
    it('returns true if the count is greater than 0', async () => {
      prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

      const result = await makeRepo().subjectHasGroup(mockSub, 1);

      expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
        where: { sub: mockSub, groupId: 1 }
      });
      expect(result).toBe(true);
    });

    it('returns false if the count is 0', async () => {
      prismaTxMock.subject_group.count.mockResolvedValueOnce(0);

      const result = await makeRepo().subjectHasGroup(mockSub, 1);

      expect(result).toBe(false);
    });
  });

  describe('subjectHasGroupName', () => {
    it('returns true if the count is greater than 0', async () => {
      prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

      const result = await makeRepo().subjectHasGroupName(mockSub, GroupName.NAVIGATOR);

      expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
        where: {
          sub: mockSub,
          group: { name: GroupName.NAVIGATOR },
          NOT: {
            group: { initiative: { code: Initiative.PCNS } }
          }
        }
      });
      expect(result).toBe(true);
    });

    it('returns false immediately if groupName is undefined', async () => {
      const result = await makeRepo().subjectHasGroupName(mockSub, undefined);

      expect(prismaTxMock.subject_group.count).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('subjectHasInitiativeGroupName', () => {
    it('returns true if the count is greater than 0 with filtered group array', async () => {
      prismaTxMock.subject_group.count.mockResolvedValueOnce(1);

      const result = await makeRepo().subjectHasInitiativeGroupName(mockSub, Initiative.HOUSING, [
        GroupName.NAVIGATOR,
        undefined
      ]);

      expect(prismaTxMock.subject_group.count).toHaveBeenCalledWith({
        where: {
          sub: mockSub,
          group: {
            name: { in: [GroupName.NAVIGATOR] },
            initiative: { code: Initiative.HOUSING }
          }
        }
      });
      expect(result).toBe(true);
    });

    it('returns false immediately if groupNames array is empty', async () => {
      const result = await makeRepo().subjectHasInitiativeGroupName(mockSub, Initiative.HOUSING, []);

      expect(prismaTxMock.subject_group.count).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});
