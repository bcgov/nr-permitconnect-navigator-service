import { TEST_CURRENT_CONTEXT } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '../../../src/controllers/accessRequest';
import { assignPermissions } from '../../../src/services/coms';
import { getInitiative } from '../../../src/services/initiative';
import { createUser, readUser } from '../../../src/services/user';
import {
  assignGroup,
  getCorrespondingGlobalGroup,
  getGroups,
  getSubjectGroups,
  removeGroup,
  subjectHasGroupName
} from '../../../src/services/yars';
import { AccessRequestStatus, GroupName, IdentityProviderKind } from '../../../src/utils/enums/application';

import type { Request, Response } from 'express';
import type { Mock } from 'vitest';
import type { AccessRequest, User } from '../../../src/types';
import {
  createUserAccessRequest,
  getAccessRequest,
  getAccessRequests,
  updateAccessRequest
} from '../../../src/services/accessRequest';

vi.mock('../../../src/services/accessRequest', () => ({
  createUserAccessRequest: vi.fn(),
  getAccessRequest: vi.fn(),
  getAccessRequests: vi.fn(),
  updateAccessRequest: vi.fn()
}));

vi.mock('../../../src/services/coms', () => ({
  assignPermissions: vi.fn()
}));

vi.mock('../../../src/services/yars', () => ({
  assignGroup: vi.fn(),
  getCorrespondingGlobalGroup: vi.fn(),
  getGroups: vi.fn(),
  getSubjectGroups: vi.fn(),
  removeGroup: vi.fn(),
  subjectHasGroupName: vi.fn()
}));

vi.mock('../../../src/services/user', () => ({
  createUser: vi.fn(),
  readUser: vi.fn()
}));

vi.mock('../../../src/services/initiative', () => ({
  getInitiative: vi.fn()
}));

const mockCreateUserAccessRequest = createUserAccessRequest as Mock;
const mockGetAccessRequest = getAccessRequest as Mock;
const mockGetAccessRequests = getAccessRequests as Mock;
const mockUpdateAccessRequest = updateAccessRequest as Mock;
const mockAssignPermissions = assignPermissions as Mock;
const mockGetGroups = getGroups as Mock;
const mockAssignGroup = assignGroup as Mock;
const mockCreateUser = createUser as Mock;
const mockReadUser = readUser as Mock;
const mockGetCorrespondingGlobalGroup = getCorrespondingGlobalGroup as Mock;
const mockGetInitiative = getInitiative as Mock;
const mockGetSubjectGroups = getSubjectGroups as Mock;
const mockSubjectHasGroupName = subjectHasGroupName as Mock;
const mockRemoveGroup = removeGroup as Mock;

const mockResponse = () => {
  const res: { status?: Mock; json?: Mock; end?: Mock } = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.end = vi.fn().mockReturnValue(res);
  return res;
};

let res: { status?: Mock; json?: Mock; end?: Mock };
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  /*
   * Must use clearAllMocks when using the mocked config
   * resetAllMocks seems to cause strange issues such as
   * functions not calling as expected
   */
  vi.clearAllMocks();
});

describe('createUserAccessRequestController', () => {
  it('automatically updates user group', async () => {
    const req = {
      body: {
        accessRequest: {
          grant: true,
          groupId: 'g-new',
          update: true
        },
        user: {
          userId: 'u1'
        }
      },
      currentContext: TEST_CURRENT_CONTEXT,
      currentAuthorization: {
        groups: [{ name: GroupName.ADMIN, initiativeId: 'i1' }]
      }
    };

    mockGetInitiative.mockResolvedValue({ initiativeId: 'i1' });
    mockGetGroups.mockResolvedValue([{ groupId: 'g-new', name: GroupName.ADMIN, initiativeId: 'i1' }]);
    mockReadUser.mockResolvedValue({
      userId: 'u1',
      sub: 'sub-123',
      idp: IdentityProviderKind.AZUREIDIR
    });
    mockGetSubjectGroups.mockResolvedValue([{ groupId: 'g-old', initiativeId: 'i1', name: GroupName.ADMIN }]);
    mockSubjectHasGroupName.mockResolvedValue(false);
    mockGetCorrespondingGlobalGroup
      .mockResolvedValueOnce({ groupId: 'global-old' })
      .mockResolvedValueOnce({ groupId: 'global-new' });
    mockAssignPermissions.mockResolvedValue(undefined);

    await createUserAccessRequestController(
      req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
      res as unknown as Response
    );

    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'g-old');
    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'global-old');
    expect(mockAssignGroup).toHaveBeenNthCalledWith(1, prismaTxMock, 'sub-123', 'g-new');
    expect(mockAssignGroup).toHaveBeenNthCalledWith(2, prismaTxMock, 'sub-123', 'global-new');
    expect(mockAssignPermissions).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      userId: 'u1',
      grant: true,
      groupId: 'g-new',
      status: AccessRequestStatus.APPROVED
    });
  });

  describe('admin', () => {
    it('automatically grants access', async () => {
      const req = {
        body: {
          accessRequest: {
            grant: true,
            groupId: 'g1',
            update: false
          },
          user: {
            userId: 'u1'
          }
        },
        currentContext: TEST_CURRENT_CONTEXT,
        currentAuthorization: {
          groups: [
            // Makes isUserAdmin return true
            { name: GroupName.ADMIN, initiativeId: 'i1' }
          ]
        }
      };

      mockGetInitiative.mockResolvedValue({ initiativeId: 'i1' });
      mockGetGroups.mockResolvedValue([{ groupId: 'g1', name: GroupName.ADMIN }]);
      mockReadUser.mockResolvedValue({
        userId: 'u1',
        sub: 'sub-123',
        idp: IdentityProviderKind.AZUREIDIR
      });
      mockGetSubjectGroups.mockResolvedValue([]);
      mockGetCorrespondingGlobalGroup.mockResolvedValue({
        groupId: 'global-g1'
      });
      mockAssignPermissions.mockResolvedValue(undefined);

      await createUserAccessRequestController(
        req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
        res as unknown as Response
      );

      expect(mockAssignGroup).toHaveBeenCalledTimes(2);
      expect(mockAssignGroup).toHaveBeenNthCalledWith(1, prismaTxMock, 'sub-123', 'g1');
      expect(mockAssignGroup).toHaveBeenNthCalledWith(2, prismaTxMock, 'sub-123', 'global-g1');
      expect(mockAssignPermissions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        userId: 'u1',
        grant: true,
        groupId: 'g1',
        status: AccessRequestStatus.APPROVED
      });
    });

    it('removes user groups for initiative', async () => {
      const req = {
        body: {
          accessRequest: {
            grant: false,
            groupId: 'g1',
            update: false
          },
          user: {
            userId: 'u1'
          }
        },
        currentContext: TEST_CURRENT_CONTEXT,
        currentAuthorization: {
          groups: [{ name: GroupName.ADMIN, initiativeId: 'i1' }]
        }
      };

      mockGetInitiative.mockResolvedValue({ initiativeId: 'i1' });
      mockGetGroups.mockResolvedValue([{ groupId: 'g1', name: GroupName.ADMIN, initiativeId: 'i1' }]);
      mockReadUser.mockResolvedValue({
        userId: 'u1',
        sub: 'sub-123',
        idp: IdentityProviderKind.AZUREIDIR
      });
      mockGetSubjectGroups.mockResolvedValue([{ groupId: 'g1', initiativeId: 'i1', name: GroupName.ADMIN }]);
      mockSubjectHasGroupName.mockResolvedValue(false);
      mockGetCorrespondingGlobalGroup.mockResolvedValueOnce({ groupId: 'global-g1' });
      mockAssignPermissions.mockResolvedValue(undefined);

      await createUserAccessRequestController(
        req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
        res as unknown as Response
      );

      expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'g1');
      expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'global-g1');
      expect(mockAssignGroup).not.toHaveBeenCalled();
      expect(mockAssignPermissions).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(undefined);
    });
  });

  describe('supervisor', () => {
    it('creates access request', async () => {
      const req = {
        body: {
          accessRequest: {
            grant: true,
            groupId: 'g1',
            update: false
          },
          user: {
            sub: 'sub-123',
            idp: IdentityProviderKind.AZUREIDIR
          }
        },
        currentContext: TEST_CURRENT_CONTEXT,
        currentAuthorization: {
          groups: [{ name: GroupName.SUPERVISOR, initiativeId: 'i1' }]
        }
      };

      mockGetInitiative.mockResolvedValue({ initiativeId: 'i1' });
      mockGetGroups.mockResolvedValue([{ groupId: 'g1', name: GroupName.NAVIGATOR, initiativeId: 'i1' }]);
      mockCreateUser.mockResolvedValue({
        userId: 'u1',
        sub: 'sub-123',
        idp: IdentityProviderKind.AZUREIDIR
      });
      mockGetSubjectGroups.mockResolvedValue([]);
      mockCreateUserAccessRequest.mockResolvedValue({
        id: 'req-1',
        userId: 'u1',
        groupId: 'g1',
        status: AccessRequestStatus.PENDING
      });

      await createUserAccessRequestController(
        req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
        res as unknown as Response
      );

      expect(mockCreateUserAccessRequest).toHaveBeenCalledWith(prismaTxMock, {
        grant: true,
        groupId: 'g1',
        update: false,
        userId: 'u1'
      });
      expect(mockAssignGroup).not.toHaveBeenCalled();
      expect(mockAssignPermissions).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        id: 'req-1',
        userId: 'u1',
        groupId: 'g1',
        status: AccessRequestStatus.PENDING
      });
    });
  });
});

describe('processUserAccessRequestController', () => {
  it('approves and grants access', async () => {
    const req = {
      params: { accessRequestId: 'ar-1' },
      body: { approve: true },
      currentContext: TEST_CURRENT_CONTEXT
    };

    mockGetAccessRequest.mockResolvedValue({
      accessRequestId: 'ar-1',
      userId: 'u1',
      grant: true,
      groupId: 'g1'
    });
    mockReadUser.mockResolvedValue({
      userId: 'u1',
      sub: 'sub-123',
      idp: IdentityProviderKind.AZUREIDIR
    });
    mockGetSubjectGroups.mockResolvedValue([{ groupId: 'g-other', initiativeId: 'i1' }]);
    mockGetCorrespondingGlobalGroup.mockResolvedValue({
      groupId: 'global-g1'
    });
    mockAssignPermissions.mockResolvedValue(undefined);

    await processUserAccessRequestController(
      req as unknown as Request<{ accessRequestId: string }, never, { approve: boolean }>,
      res as unknown as Response
    );

    expect(mockAssignGroup).toHaveBeenCalledTimes(2);
    expect(mockAssignGroup).toHaveBeenNthCalledWith(1, prismaTxMock, 'sub-123', 'g1');
    expect(mockAssignGroup).toHaveBeenNthCalledWith(2, prismaTxMock, 'sub-123', 'global-g1');
    expect(mockUpdateAccessRequest).toHaveBeenCalledWith(
      prismaTxMock,
      { status: AccessRequestStatus.APPROVED },
      'ar-1'
    );
    expect(mockAssignPermissions).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('approves and removes access', async () => {
    const req = {
      params: { accessRequestId: 'ar-1' },
      body: { approve: true },
      currentContext: TEST_CURRENT_CONTEXT
    };

    mockGetAccessRequest.mockResolvedValue({
      accessRequestId: 'ar-1',
      userId: 'u1',
      grant: false,
      groupId: 'g1'
    });
    mockReadUser.mockResolvedValue({
      userId: 'u1',
      sub: 'sub-123',
      idp: IdentityProviderKind.AZUREIDIR
    });
    mockGetSubjectGroups.mockResolvedValue([{ groupId: 'g1', initiativeId: 'i1', name: 'ADMIN' }]);
    mockSubjectHasGroupName.mockResolvedValue(false);
    mockGetCorrespondingGlobalGroup.mockResolvedValue({
      groupId: 'global-g1'
    });
    mockAssignPermissions.mockResolvedValue(undefined);

    await processUserAccessRequestController(
      req as unknown as Request<{ accessRequestId: string }, never, { approve: boolean }>,
      res as unknown as Response
    );

    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'g1');
    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'global-g1');
    expect(mockUpdateAccessRequest).toHaveBeenCalledWith(
      prismaTxMock,
      { status: AccessRequestStatus.APPROVED },
      'ar-1'
    );
    expect(mockAssignPermissions).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('rejects access request', async () => {
    const req = {
      params: { accessRequestId: 'ar-1' },
      body: { approve: false },
      currentContext: TEST_CURRENT_CONTEXT
    };

    mockGetAccessRequest.mockResolvedValue({
      accessRequestId: 'ar-1',
      userId: 'u1',
      grant: true,
      groupId: 'g1'
    });
    mockReadUser.mockResolvedValue({
      userId: 'u1',
      sub: 'sub-123',
      idp: IdentityProviderKind.AZUREIDIR
    });

    await processUserAccessRequestController(
      req as unknown as Request<{ accessRequestId: string }, never, { approve: boolean }>,
      res as unknown as Response
    );

    expect(mockUpdateAccessRequest).toHaveBeenCalledWith(
      prismaTxMock,
      { status: AccessRequestStatus.REJECTED },
      'ar-1'
    );
    expect(mockAssignGroup).not.toHaveBeenCalled();
    expect(mockRemoveGroup).not.toHaveBeenCalled();
    expect(mockAssignPermissions).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });
});

describe('getAccessRequestsController', () => {
  it('returns access requests with 200', async () => {
    const req = {
      currentContext: TEST_CURRENT_CONTEXT
    };

    const mockData = [{ accessRequestId: 'ar-1' }, { accessRequestId: 'ar-2' }];

    mockGetAccessRequests.mockResolvedValue(mockData);

    await getAccessRequestsController(req as unknown as Request, res as unknown as Response);

    expect(mockGetAccessRequests).toHaveBeenCalledWith(prismaTxMock, TEST_CURRENT_CONTEXT.initiative);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });
});
