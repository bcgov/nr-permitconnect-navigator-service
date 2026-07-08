import { mockReset } from 'vitest-mock-extended';

import {
  TEST_CURRENT_AUTH_CONTEXT_ADMIN,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT,
  TEST_GROUP_1,
  TEST_GROUP_2_ADMIN,
  TEST_IDIR_USER_1,
  TEST_SUBJECT_GROUP_1
} from '../data/index.ts';
import { mockRepos } from '../../__mocks__/unitOfWorkMock.ts';
import * as accessRequestDomain from '../../../src/domains/accessRequest.ts';
import * as userDomain from '../../../src/domains/user.ts';
import * as yarsDomain from '../../../src/domains/yars.ts';
import { assignPermissions } from '../../../src/external/coms.ts';
import {
  createAccessRequestService,
  getAccessRequestsService,
  processAccessRequestService
} from '../../../src/services/accessRequest.ts';
import { AccessRequestStatus, IdentityProviderKind } from '../../../src/utils/enums/application.ts';
import Problem from '../../../src/utils/problem.ts';

import type { AccessRequest, User } from '../../../src/types/index.ts';

vi.mock('config');
vi.mock('../../../src/external/coms.ts', () => ({
  assignPermissions: vi.fn()
}));

const isUserAdminSpy = vi.spyOn(accessRequestDomain, 'isUserAdmin');
const removeUserGroupsSpy = vi.spyOn(accessRequestDomain, 'removeUserGroups');
const createUserSpy = vi.spyOn(userDomain, 'createUser');
const assignGroupSpy = vi.spyOn(yarsDomain, 'assignGroup');
const getCorrespondingGlobalGroupSpy = vi.spyOn(yarsDomain, 'getCorrespondingGlobalGroup');
const getGroupsSpy = vi.spyOn(yarsDomain, 'getGroups');

describe('access request service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReset(mockRepos);
  });

  describe('getAccessRequestsService', () => {
    it('fetches access requests for an initiative', async () => {
      const accessRequest = {
        accessRequestId: 'req-1',
        userId: 'user-1',
        groupId: 1,
        grant: true,
        status: AccessRequestStatus.PENDING,
        createdAt: new Date(),
        createdBy: 'system',
        updatedAt: new Date(),
        updatedBy: 'system'
      } as AccessRequest;

      mockRepos.accessRequest.findMany.mockResolvedValue([accessRequest]);

      const result = await getAccessRequestsService(TEST_CURRENT_CONTEXT.initiative);

      expect(mockRepos.accessRequest.findMany).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.findMany).toHaveBeenCalledWith({
        where: {
          group: {
            initiative: {
              code: TEST_CURRENT_CONTEXT.initiative
            }
          }
        },
        include: {
          group: true
        }
      });
      expect(result).toEqual([accessRequest]);
    });
  });

  describe('createAccessRequestService', () => {
    const testAccessUser: User = { ...TEST_IDIR_USER_1 };
    const testAccessReq = {
      accessRequestId: 'req-1',
      userId: 'user-1',
      groupId: 2,
      grant: true,
      status: AccessRequestStatus.PENDING,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system',
      update: false
    } as AccessRequest & { update: boolean };

    it('creates a new access request when user is not admin and user is new', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);
      mockRepos.accessRequest.create.mockResolvedValue(undefined as never);
      mockRepos.accessRequest.findFirst.mockResolvedValue({
        ...testAccessReq,
        groupId: 1,
        status: AccessRequestStatus.PENDING
      });

      const navigatorAccessReq = { ...testAccessReq, groupId: 1 };

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        navigatorAccessReq,
        testAccessUser
      );

      expect(getGroupsSpy).toHaveBeenCalledWith(
        expect.objectContaining({ group: mockRepos.group, initiative: mockRepos.initiative }),
        TEST_CURRENT_CONTEXT.initiative
      );
      expect(mockRepos.accessRequest.create).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.create).toHaveBeenCalledWith(
        expect.objectContaining({
          grant: navigatorAccessReq.grant,
          groupId: navigatorAccessReq.groupId,
          status: AccessRequestStatus.PENDING,
          userId: navigatorAccessReq.userId
        })
      );
      expect(result.isAdmin).toBe(false);
      expect(result.data).toBeDefined();
    });

    it('creates a new user and access request if user does not exist in DB', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);

      const newUser = { ...testAccessUser, userId: undefined };
      const createdUser = { ...testAccessUser, userId: 'new-user-1' };

      createUserSpy.mockResolvedValue(createdUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);
      mockRepos.accessRequest.create.mockResolvedValue(undefined as never);

      const expectedResponseData = { ...testAccessReq, groupId: 1 };
      mockRepos.accessRequest.findFirst.mockResolvedValue(expectedResponseData);

      const navigatorAccessReq = { ...testAccessReq, groupId: 1 };

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
        navigatorAccessReq,
        newUser as never
      );

      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.create).toHaveBeenCalledTimes(1);
      expect(await result.data).toEqual(expectedResponseData);
    });

    it('throws 404 when user is not found during creation/lookup', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue(null);

      const navigatorAccessReq = { ...testAccessReq, groupId: 1 };

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          navigatorAccessReq,
          testAccessUser
        )
      ).rejects.toThrow(new Problem(404, { detail: 'User not found' }));
    });

    it('throws 422 when granting access without a group ID', async () => {
      isUserAdminSpy.mockResolvedValue(true);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1, TEST_GROUP_2_ADMIN] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);

      const invalidReq = { ...testAccessReq, groupId: undefined };

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_ADMIN,
          invalidReq as never,
          testAccessUser
        )
      ).rejects.toThrow(new Problem(422, { detail: 'Must provide a group to grant' }));
    });

    it('throws 403 when user tries to modify a group they are not allowed to', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);

      const unrequestableReq = { ...testAccessReq, groupId: 999 };

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          unrequestableReq,
          testAccessUser
        )
      ).rejects.toThrow(new Problem(403, { detail: 'Cannot modify requested group' }));
    });

    it('throws 409 when user already in initiative on new request', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([TEST_SUBJECT_GROUP_1]);

      const unrequestableReq = { ...testAccessReq, groupId: 1, update: false };

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          unrequestableReq,
          testAccessUser
        )
      ).rejects.toThrow(new Problem(409, { detail: 'User already exists' }));
    });

    it('throws 409 when user already assigned to requested group', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([{ ...TEST_SUBJECT_GROUP_1, groupId: 1 }]);

      const navigatorReq = { ...testAccessReq, groupId: 1, update: true };

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          navigatorReq,
          testAccessUser
        )
      ).rejects.toThrow(new Problem(409, { detail: 'User is already assigned this group' }));
    });

    it('throws 409 when user is not an IDIR user', async () => {
      isUserAdminSpy.mockResolvedValue(false);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1] as never);
      mockRepos.user.findById.mockResolvedValue({ ...testAccessUser, idp: IdentityProviderKind.BCEIDBUSINESS });
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);

      await expect(
        createAccessRequestService(
          TEST_CURRENT_CONTEXT,
          TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
          { ...testAccessReq, groupId: 1 },
          testAccessUser
        )
      ).rejects.toThrow(new Problem(409, { detail: 'User must be an IDIR user to be assigned this group' }));
    });

    it('assigns groups when admin grants access to existing user', async () => {
      isUserAdminSpy.mockResolvedValue(true);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1, TEST_GROUP_2_ADMIN] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);
      assignGroupSpy.mockResolvedValue({ sub: testAccessUser.sub, roleId: 2 });

      getCorrespondingGlobalGroupSpy.mockResolvedValue({
        initiativeCode: 'GLOBAL',
        initiativeId: '99',
        groupId: 2,
        name: 'GLOBAL_ADMIN',
        label: 'Global Admin'
      } as never);

      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_ADMIN,
        testAccessReq,
        testAccessUser
      );

      expect(assignGroupSpy).toHaveBeenCalledTimes(2);
      expect(getCorrespondingGlobalGroupSpy).toHaveBeenCalledTimes(1);
      expect(result.isAdmin).toBe(true);
    });

    it('removes groups when admin removes access', async () => {
      isUserAdminSpy.mockResolvedValue(true);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1, TEST_GROUP_2_ADMIN] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([TEST_SUBJECT_GROUP_1]);
      removeUserGroupsSpy.mockResolvedValue(undefined);

      const removeReq = { ...testAccessReq, grant: false, groupId: 1 };

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_ADMIN,
        removeReq,
        testAccessUser
      );

      expect(removeUserGroupsSpy).toHaveBeenCalledTimes(1);
      expect(assignGroupSpy).not.toHaveBeenCalled();
      expect(result.isAdmin).toBe(true);
      expect(result.data).toBeUndefined();
    });

    it('updates groups when admin updates access for existing user in initiative', async () => {
      isUserAdminSpy.mockResolvedValue(true);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1, TEST_GROUP_2_ADMIN] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([TEST_SUBJECT_GROUP_1]);
      removeUserGroupsSpy.mockResolvedValue(undefined);
      assignGroupSpy.mockResolvedValue({ sub: testAccessUser.sub, roleId: TEST_GROUP_2_ADMIN.groupId });

      getCorrespondingGlobalGroupSpy.mockResolvedValue({
        initiativeCode: 'GLOBAL',
        initiativeId: '99',
        groupId: 2,
        name: 'GLOBAL_ADMIN',
        label: 'Global Admin'
      } as never);

      const updateReq = { ...testAccessReq, update: true };

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_ADMIN,
        updateReq,
        testAccessUser
      );

      expect(removeUserGroupsSpy).toHaveBeenCalledTimes(1);
      expect(assignGroupSpy).toHaveBeenCalledTimes(2);
      expect(result.isAdmin).toBe(true);
    });

    it('catches and logs errors when assignPermissions fails but still succeeds', async () => {
      isUserAdminSpy.mockResolvedValue(true);
      getGroupsSpy.mockResolvedValue([TEST_GROUP_1, TEST_GROUP_2_ADMIN] as never);
      mockRepos.user.findById.mockResolvedValue(testAccessUser);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);
      assignGroupSpy.mockResolvedValue({ sub: testAccessUser.sub, roleId: 2 });
      getCorrespondingGlobalGroupSpy.mockResolvedValue({ groupId: 2 } as never);

      const mockedAssignPermissions = vi.mocked(assignPermissions);
      mockedAssignPermissions.mockRejectedValueOnce(new Problem(500, { detail: 'COMS failed' }));

      const result = await createAccessRequestService(
        TEST_CURRENT_CONTEXT,
        TEST_CURRENT_AUTH_CONTEXT_ADMIN,
        testAccessReq,
        testAccessUser
      );

      expect(mockedAssignPermissions).toHaveBeenCalled();
      expect(result.isAdmin).toBe(true);
    });
  });

  describe('processAccessRequestService', () => {
    const testAccessReq = {
      accessRequestId: 'req-1',
      userId: 'user-1',
      groupId: 1,
      grant: true,
      status: AccessRequestStatus.PENDING,
      createdAt: new Date(),
      createdBy: 'system',
      updatedAt: new Date(),
      updatedBy: 'system'
    } as AccessRequest;

    it('approves an access request and assigns groups', async () => {
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(testAccessReq);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]).mockResolvedValueOnce([]);

      getCorrespondingGlobalGroupSpy.mockResolvedValue({
        initiativeCode: 'GLOBAL',
        initiativeId: '99',
        groupId: 2,
        name: 'GLOBAL_ADMIN',
        label: 'Global Admin'
      } as never);

      assignGroupSpy.mockResolvedValue({ sub: TEST_IDIR_USER_1.sub, roleId: 1 });

      mockRepos.accessRequest.update.mockResolvedValue({
        ...testAccessReq,
        status: AccessRequestStatus.APPROVED
      });

      await processAccessRequestService(TEST_CURRENT_CONTEXT, testAccessReq.accessRequestId, true);

      expect(mockRepos.accessRequest.findUniqueOrThrow).toHaveBeenCalledTimes(1);
      expect(assignGroupSpy).toHaveBeenCalledTimes(2);
      expect(mockRepos.accessRequest.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.update).toHaveBeenCalledWith(
        { accessRequestId: testAccessReq.accessRequestId },
        { status: AccessRequestStatus.APPROVED }
      );
      expect(assignPermissions).toHaveBeenCalledTimes(1);
    });

    it('rejects an access request', async () => {
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(testAccessReq);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([TEST_SUBJECT_GROUP_1]);

      await processAccessRequestService(TEST_CURRENT_CONTEXT, testAccessReq.accessRequestId, false);

      expect(mockRepos.accessRequest.update).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.update).toHaveBeenCalledWith(
        { accessRequestId: testAccessReq.accessRequestId },
        { status: AccessRequestStatus.REJECTED }
      );
      expect(assignPermissions).not.toHaveBeenCalled();
    });

    it('throws 404 when user does not exist', async () => {
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(testAccessReq);
      mockRepos.user.findById.mockResolvedValue(null);

      await expect(
        processAccessRequestService(TEST_CURRENT_CONTEXT, testAccessReq.accessRequestId, true)
      ).rejects.toThrow(new Problem(404, { detail: 'User does not exist' }));
    });

    it('throws 422 when granting access without a group ID', async () => {
      const invalidReq = { ...testAccessReq, groupId: undefined };
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(invalidReq as never);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);

      await expect(processAccessRequestService(TEST_CURRENT_CONTEXT, invalidReq.accessRequestId, true)).rejects.toThrow(
        new Problem(422, { detail: 'Must provide a group to grant' })
      );
    });

    it('throws 409 when user is already assigned the role on approval', async () => {
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(testAccessReq);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([
        { ...TEST_SUBJECT_GROUP_1, groupId: testAccessReq.groupId }
      ]);

      await expect(
        processAccessRequestService(TEST_CURRENT_CONTEXT, testAccessReq.accessRequestId, true)
      ).rejects.toThrow(new Problem(409, { detail: 'User is already assigned this role' }));
    });

    it('throws 409 when user is not an IDIR user', async () => {
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(testAccessReq);
      mockRepos.user.findById.mockResolvedValue({ ...TEST_IDIR_USER_1, idp: IdentityProviderKind.BCEIDBUSINESS });
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([]);

      await expect(
        processAccessRequestService(TEST_CURRENT_CONTEXT, testAccessReq.accessRequestId, true)
      ).rejects.toThrow(new Problem(409, { detail: 'User must be an IDIR user to be assigned this role' }));
    });

    it('removes user groups when denying a revocation request', async () => {
      const revocationReq = { ...testAccessReq, grant: false };
      mockRepos.accessRequest.findUniqueOrThrow.mockResolvedValue(revocationReq);
      mockRepos.user.findById.mockResolvedValue(TEST_IDIR_USER_1);
      mockRepos.subjectGroup.getSubjectGroups.mockResolvedValue([TEST_SUBJECT_GROUP_1]);
      removeUserGroupsSpy.mockResolvedValue(undefined);

      await processAccessRequestService(TEST_CURRENT_CONTEXT, revocationReq.accessRequestId, true);

      expect(removeUserGroupsSpy).toHaveBeenCalledTimes(1);
      expect(mockRepos.accessRequest.update).toHaveBeenCalledWith(
        { accessRequestId: revocationReq.accessRequestId },
        { status: AccessRequestStatus.APPROVED }
      );
    });
  });
});
