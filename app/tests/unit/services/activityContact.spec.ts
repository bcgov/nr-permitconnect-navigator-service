import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { TEST_ACTIVITY_CONTACT_1 } from '../data/index.ts';
import * as activityContactService from '../../../src/services/activityContact.ts';
import { ActivityContactRole } from '../../../src/utils/enums/projectCommon.ts';

describe('createActivityContact', () => {
  it('calls activity_contact.create and returns result', async () => {
    prismaTxMock.activity_contact.create.mockResolvedValueOnce(TEST_ACTIVITY_CONTACT_1);
    const response = await activityContactService.createActivityContact(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId,
      ActivityContactRole.PRIMARY
    );

    expect(prismaTxMock.activity_contact.create).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual(TEST_ACTIVITY_CONTACT_1);
  });
});

describe('deleteActivityContact', () => {
  it('calls activity_contact.delete', async () => {
    await activityContactService.deleteActivityContact(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );

    expect(prismaTxMock.activity_contact.delete).toHaveBeenCalledTimes(1);
  });
});

describe('getActivityContact', () => {
  it('calls activity_contact.findFirstOrThrow', async () => {
    await activityContactService.getActivityContact(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId
    );

    expect(prismaTxMock.activity_contact.findFirstOrThrow).toHaveBeenCalledTimes(1);
  });
});

describe('listActivityContacts', () => {
  it('calls activity_contact.findMany', async () => {
    prismaTxMock.activity_contact.findMany.mockResolvedValueOnce([TEST_ACTIVITY_CONTACT_1]);
    const response = await activityContactService.listActivityContacts(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId
    );

    expect(prismaTxMock.activity_contact.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([TEST_ACTIVITY_CONTACT_1]);
  });
});

describe('updateActivityContact', () => {
  it('calls activity_contact.update', async () => {
    await activityContactService.updateActivityContact(
      prismaTxMock,
      TEST_ACTIVITY_CONTACT_1.activityId,
      TEST_ACTIVITY_CONTACT_1.contactId,
      ActivityContactRole.MEMBER
    );

    expect(prismaTxMock.activity_contact.update).toHaveBeenCalledTimes(1);
  });
});
