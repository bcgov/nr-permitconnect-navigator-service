import {
  TEST_ACTIVITY_CONTACT_1,
  TEST_CONTACT_1,
  TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
  TEST_CURRENT_CONTEXT
} from '../../data';
import { prismaTxMock } from '../../../__mocks__/prismaMock';
import * as activityContactService from '../../../../src/services/activityContact';
import * as contactService from '../../../../src/services/contact';
import * as activityContactHelpers from '../../../../src/services/helpers/activityContact';
import { ActivityContactRole } from '../../../../src/utils/enums/projectCommon';

describe('verifyPrimaryChange', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const listActivityContactsSpy = jest.spyOn(activityContactService, 'listActivityContacts');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const updateActivityContactSpy = jest.spyOn(activityContactService, 'updateActivityContact');

  const mockAuthBase = { attributes: [], groups: [] };

  it('should throw Problem 403 if user is neither Primary nor Navigator', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    listActivityContactsSpy.mockResolvedValue([
      { ...TEST_ACTIVITY_CONTACT_1, contactId: TEST_CONTACT_1.contactId, role: ActivityContactRole.ADMIN }
    ]);

    await expect(
      activityContactHelpers.verifyPrimaryChange(prismaTxMock, 'activity-id', mockAuthBase, TEST_CURRENT_CONTEXT)
    ).rejects.toMatchObject({
      status: 403,
      detail: 'User lacks required role.'
    });
  });

  it('should pass and demote current primary if authorized via scope:all', async () => {
    const scopeAllAuth = { attributes: ['scope:all'], groups: [] };
    listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);
    updateActivityContactSpy.mockResolvedValue({ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN });

    await activityContactHelpers.verifyPrimaryChange(prismaTxMock, 'activity-id', scopeAllAuth, TEST_CURRENT_CONTEXT);

    expect(searchContactsSpy).not.toHaveBeenCalled();
    expect(updateActivityContactSpy).toHaveBeenCalledWith(
      prismaTxMock,
      'activity-id',
      TEST_ACTIVITY_CONTACT_1.contactId,
      ActivityContactRole.ADMIN
    );
  });

  it('should pass if user is a Navigator in the correct initiative', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);

    await activityContactHelpers.verifyPrimaryChange(
      prismaTxMock,
      'activity-id',
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT
    );

    expect(listActivityContactsSpy).toHaveBeenCalled();
    expect(updateActivityContactSpy).toHaveBeenCalled();
  });

  it('should pass if user is the current Primary contact', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    listActivityContactsSpy.mockResolvedValue([
      { ...TEST_ACTIVITY_CONTACT_1, contactId: TEST_CONTACT_1.contactId, role: ActivityContactRole.PRIMARY }
    ]);

    await activityContactHelpers.verifyPrimaryChange(prismaTxMock, 'activity-id', mockAuthBase, TEST_CURRENT_CONTEXT);

    expect(updateActivityContactSpy).toHaveBeenCalledTimes(1);
  });

  it('should NOT call updateActivityContact if no current primary exists', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);

    listActivityContactsSpy.mockResolvedValue([
      { ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN },
      { ...TEST_ACTIVITY_CONTACT_1, contactId: 'some-other-id', role: ActivityContactRole.MEMBER }
    ]);

    await activityContactHelpers.verifyPrimaryChange(
      prismaTxMock,
      'activity-id',
      TEST_CURRENT_AUTH_CONTEXT_NAVIGATOR,
      TEST_CURRENT_CONTEXT
    );

    expect(listActivityContactsSpy).toHaveBeenCalled();
    expect(updateActivityContactSpy).not.toHaveBeenCalled();
  });
});
