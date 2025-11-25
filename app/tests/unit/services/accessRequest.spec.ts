import { prismaTxMock } from '../../__mocks__/prismaMock';

import * as accessRequestService from '../../../src/services/accessRequest';
import { AccessRequest } from '../../../src/types';
import { Initiative } from '../../../src/utils/enums/application';

const ACCESS_REQUEST = {
  userId: '123',
  grant: true,
  groupId: 1
} as AccessRequest;

describe('createUserAccessRequest', () => {
  it('calls access_request.create and returns result', async () => {
    prismaTxMock.access_request.create.mockResolvedValueOnce(ACCESS_REQUEST);
    const response = await accessRequestService.createUserAccessRequest(prismaTxMock, ACCESS_REQUEST);

    expect(prismaTxMock.access_request.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(ACCESS_REQUEST);
  });
});

describe('getAccessRequest', () => {
  it('calls access_request.findUniqueOrThrow and returns result', async () => {
    prismaTxMock.access_request.findUniqueOrThrow.mockResolvedValueOnce(ACCESS_REQUEST);
    const response = await accessRequestService.getAccessRequest(prismaTxMock, Initiative.HOUSING, '1');

    expect(prismaTxMock.access_request.findUniqueOrThrow).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(ACCESS_REQUEST);
  });
});

describe('getAccessRequests', () => {
  it('calls access_request.findMany and returns result', async () => {
    prismaTxMock.access_request.findMany.mockResolvedValueOnce([ACCESS_REQUEST]);
    const response = await accessRequestService.getAccessRequests(prismaTxMock, Initiative.HOUSING);

    expect(prismaTxMock.access_request.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([ACCESS_REQUEST]);
  });
});

describe('updateAccessRequest', () => {
  it('calls access_request.update and returns result', async () => {
    prismaTxMock.access_request.update.mockResolvedValueOnce(ACCESS_REQUEST);
    const response = await accessRequestService.updateAccessRequest(prismaTxMock, {
      ...ACCESS_REQUEST,
      accessRequestId: '123',
      updatedAt: new Date(),
      updatedBy: 'USER123'
    } as AccessRequest);

    expect(prismaTxMock.access_request.update).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(ACCESS_REQUEST);
  });
});
