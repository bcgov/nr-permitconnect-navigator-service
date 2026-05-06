import { TEST_CURRENT_CONTEXT } from '../data';
import { prismaTxMock } from '../../__mocks__/prismaMock';
import {
  createUserAccessRequestController,
  getAccessRequestsController,
  processUserAccessRequestController
} from '../../../src/controllers/accessRequest';
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
import type { AccessRequest, User } from '../../../src/types';
import {
  createUserAccessRequest,
  getAccessRequest,
  getAccessRequests,
  updateAccessRequest
} from '../../../src/services/accessRequest';

jest.mock('../../../src/services/accessRequest', () => ({
  createUserAccessRequest: jest.fn(),
  getAccessRequest: jest.fn(),
  getAccessRequests: jest.fn(),
  updateAccessRequest: jest.fn()
}));

jest.mock('../../../src/services/yars', () => ({
  assignGroup: jest.fn(),
  getCorrespondingGlobalGroup: jest.fn(),
  getGroups: jest.fn(),
  getSubjectGroups: jest.fn(),
  removeGroup: jest.fn(),
  subjectHasGroupName: jest.fn()
}));

jest.mock('../../../src/services/user', () => ({
  createUser: jest.fn(),
  readUser: jest.fn()
}));

jest.mock('../../../src/services/initiative', () => ({
  getInitiative: jest.fn()
}));

const mockCreateUserAccessRequest = createUserAccessRequest as jest.Mock;
const mockGetAccessRequest = getAccessRequest as jest.Mock;
const mockGetAccessRequests = getAccessRequests as jest.Mock;
const mockUpdateAccessRequest = updateAccessRequest as jest.Mock;
const mockGetGroups = getGroups as jest.Mock;
const mockAssignGroup = assignGroup as jest.Mock;
const mockCreateUser = createUser as jest.Mock;
const mockReadUser = readUser as jest.Mock;
const mockGetCorrespondingGlobalGroup = getCorrespondingGlobalGroup as jest.Mock;
const mockGetInitiative = getInitiative as jest.Mock;
const mockGetSubjectGroups = getSubjectGroups as jest.Mock;
const mockSubjectHasGroupName = subjectHasGroupName as jest.Mock;
const mockRemoveGroup = removeGroup as jest.Mock;

const mockResponse = () => {
  const res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock } = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
};

let res: { status?: jest.Mock; json?: jest.Mock; end?: jest.Mock };
beforeEach(() => {
  res = mockResponse();
});

afterEach(() => {
  /*
   * Must use clearAllMocks when using the mocked config
   * resetAllMocks seems to cause strange issues such as
   * functions not calling as expected
   */
  jest.clearAllMocks();
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

    await createUserAccessRequestController(
      req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
      res as unknown as Response
    );

    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'g-old');
    expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'global-old');
    expect(mockAssignGroup).toHaveBeenNthCalledWith(1, prismaTxMock, 'sub-123', 'g-new');
    expect(mockAssignGroup).toHaveBeenNthCalledWith(2, prismaTxMock, 'sub-123', 'global-new');
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

      await createUserAccessRequestController(
        req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
        res as unknown as Response
      );

      expect(mockAssignGroup).toHaveBeenCalledTimes(2);
      expect(mockAssignGroup).toHaveBeenNthCalledWith(1, prismaTxMock, 'sub-123', 'g1');
      expect(mockAssignGroup).toHaveBeenNthCalledWith(2, prismaTxMock, 'sub-123', 'global-g1');
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

      await createUserAccessRequestController(
        req as unknown as Request<never, never, { accessRequest: AccessRequest & { update: boolean }; user: User }>,
        res as unknown as Response
      );

      expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'g1');
      expect(mockRemoveGroup).toHaveBeenCalledWith(prismaTxMock, 'sub-123', 'global-g1');
      expect(mockAssignGroup).not.toHaveBeenCalled();
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
