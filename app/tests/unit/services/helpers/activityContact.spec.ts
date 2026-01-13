import * as contactService from '../../../../src/services/contact';
import * as activityContactService from '../../../../src/services/activityContact';
import * as activityContactHelpers from '../../../../src/services/helpers/activityContact';
import { ActivityContactRole } from '../../../../src/utils/enums/projectCommon';
import { TEST_ACTIVITY_CONTACT_1, TEST_CONTACT_1 } from '../../data';
import { prismaTxMock } from '../../../__mocks__/prismaMock';

describe('verifyPrimaryChange', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  const listActivityContactsSpy = jest.spyOn(activityContactService, 'listActivityContacts');
  const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  const updateActivityContactSpy = jest.spyOn(activityContactService, 'updateActivityContact');

  it('should throw Problem 403 if user lacks permissions', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    listActivityContactsSpy.mockResolvedValue([{ ...TEST_ACTIVITY_CONTACT_1, role: ActivityContactRole.ADMIN }]);

    await expect(async () =>
      activityContactHelpers.verifyPrimaryChange(prismaTxMock, [], '', '', ActivityContactRole.PRIMARY)
    ).rejects.toMatchObject({
      status: 403,
      detail: 'User lacks required role.'
    });

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
  });

  it('should run if requestedRole === PRIMARY', async () => {
    searchContactsSpy.mockResolvedValue([TEST_CONTACT_1]);
    listActivityContactsSpy.mockResolvedValue([TEST_ACTIVITY_CONTACT_1]);
    updateActivityContactSpy.mockResolvedValue(TEST_ACTIVITY_CONTACT_1);

    await activityContactHelpers.verifyPrimaryChange(prismaTxMock, [], '', '', ActivityContactRole.PRIMARY);

    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(listActivityContactsSpy).toHaveBeenCalledTimes(1);
    expect(updateActivityContactSpy).toHaveBeenCalledTimes(1);
  });

  it.each([ActivityContactRole.ADMIN, ActivityContactRole.MEMBER])(
    'should not run if requestedRole === %s',
    async (value) => {
      await activityContactHelpers.verifyPrimaryChange(prismaTxMock, [], '', '', value);

      expect(searchContactsSpy).toHaveBeenCalledTimes(0);
      expect(listActivityContactsSpy).toHaveBeenCalledTimes(0);
      expect(updateActivityContactSpy).toHaveBeenCalledTimes(0);
    }
  );
});
