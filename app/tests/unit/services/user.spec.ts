import { v4 as uuidv4 } from 'uuid';

import { prismaTxMock } from '../../__mocks__/prismaMock.ts';
import { generateNullDeleteStamps, generateNullUpdateStamps } from '../../../src/db/utils/utils.ts';
import * as contactService from '../../../src/services/contact.ts';
import * as userService from '../../../src/services/user.ts';
import { SYSTEM_ID } from '../../../src/utils/constants/application.ts';
import { IdentityProvider } from '../../../src/utils/enums/application.ts';
import { uuidv4Pattern } from '../../../src/utils/regexp.ts';

import type { Contact, IdentityProvider as IDPType, User } from '../../../src/types/index.ts';

const idirIdentityProvider: IDPType = {
  idp: IdentityProvider.IDIR,
  active: true,
  createdAt: new Date(),
  createdBy: SYSTEM_ID,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

const bceidUser: User = {
  bceidBusinessName: null,
  userId: uuidv4(),
  idp: IdentityProvider.BCEID,
  sub: 'sub',
  email: 'test@email.com',
  firstName: 'BCeID User',
  fullName: 'BCeID User',
  lastName: null,
  active: true,
  createdAt: new Date(),
  createdBy: SYSTEM_ID,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

const idirUser: User = {
  bceidBusinessName: null,
  userId: uuidv4(),
  idp: IdentityProvider.IDIR,
  sub: 'sub',
  email: 'test@email.com',
  firstName: 'Test',
  fullName: 'Test User',
  lastName: 'User',
  active: true,
  createdAt: new Date(),
  createdBy: SYSTEM_ID,
  updatedAt: null,
  updatedBy: null,
  deletedBy: null,
  deletedAt: null
};

const bceidToken = {
  sub: bceidUser.sub,
  given_name: bceidUser.firstName,
  name: bceidUser.fullName,
  family_name: bceidUser.lastName,
  email: bceidUser.email,
  identity_provider: bceidUser.idp
};

const idirToken = {
  sub: idirUser.sub,
  given_name: idirUser.firstName,
  name: idirUser.fullName,
  family_name: idirUser.lastName,
  email: idirUser.email,
  identity_provider: idirUser.idp
};

afterEach(() => {
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('createIdp', () => {
  it('creates the idp', async () => {
    prismaTxMock.identity_provider.create.mockResolvedValueOnce(idirIdentityProvider);
    const response = await userService.createIdp(prismaTxMock, IdentityProvider.IDIR);

    expect(prismaTxMock.identity_provider.create).toHaveBeenCalledTimes(1);
    expect(response).toEqual(idirIdentityProvider);
  });
});

describe('createUser', () => {
  it('searches for and returns an existing user', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    const response = await userService.createUser(prismaTxMock, idirUser);

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(response).toEqual(idirUser);
  });

  it('creates new idp if not existing', async () => {
    const readIdpSpy = jest.spyOn(userService, 'readIdp');
    const createIdpSpy = jest.spyOn(userService, 'createIdp');

    prismaTxMock.user.findFirst.mockResolvedValueOnce(null);
    readIdpSpy.mockResolvedValueOnce(null);
    prismaTxMock.user.create.mockResolvedValueOnce(idirUser);

    await userService.createUser(prismaTxMock, { ...idirUser });

    expect(readIdpSpy).toHaveBeenCalledTimes(1);
    expect(createIdpSpy).toHaveBeenCalledTimes(1);
  });

  it('creates new user if not existing', async () => {
    const readIdpSpy = jest.spyOn(userService, 'readIdp');
    const createIdpSpy = jest.spyOn(userService, 'createIdp');

    prismaTxMock.user.findFirst.mockResolvedValueOnce(null);
    readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
    prismaTxMock.user.create.mockResolvedValueOnce(idirUser);

    const response = await userService.createUser(prismaTxMock, { ...idirUser });

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(readIdpSpy).toHaveBeenCalledTimes(1);
    expect(createIdpSpy).toHaveBeenCalledTimes(0);
    expect(prismaTxMock.user.create).toHaveBeenCalledTimes(1);
    expect(response).toEqual(
      expect.objectContaining({
        ...idirUser,
        userId: expect.stringMatching(uuidv4Pattern)
      })
    );
  });

  it('uses existing transaction if provided', async () => {
    const readIdpSpy = jest.spyOn(userService, 'readIdp');

    prismaTxMock.user.findFirst.mockResolvedValueOnce(null);
    readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
    prismaTxMock.user.create.mockResolvedValueOnce(idirUser);

    await userService.createUser(prismaTxMock, { ...idirUser });
  });
});

describe('getCurrentUserId', () => {
  it('should return user id if found', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    const response = await userService.getCurrentUserId(prismaTxMock, 'sub');

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(response).toEqual(idirUser.userId);
  });

  it('should return defaultValue if user not found', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(null);
    const response = await userService.getCurrentUserId(prismaTxMock, 'test');

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(response).toEqual(undefined);
  });
});

describe('listIdps', () => {
  it('calls identity_provider.findMany', async () => {
    prismaTxMock.identity_provider.findMany.mockResolvedValueOnce([idirIdentityProvider]);
    const response = await userService.listIdps(prismaTxMock, true);

    expect(prismaTxMock.identity_provider.findMany).toHaveBeenCalledTimes(1);
    expect(response).toStrictEqual([idirIdentityProvider]);
  });
});

describe('login', () => {
  let createUserSpy = jest.spyOn(userService, 'createUser');
  let updateUserSpy = jest.spyOn(userService, 'updateUser');
  let searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
  let upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

  beforeEach(() => {
    createUserSpy = jest.spyOn(userService, 'createUser');
    updateUserSpy = jest.spyOn(userService, 'updateUser');
    searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
    upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');
  });

  it('searches for and returns an existing user', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    updateUserSpy.mockResolvedValueOnce(idirUser);
    searchContactsSpy.mockResolvedValueOnce({} as Contact[]);

    await userService.login(prismaTxMock, idirToken);

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
  });

  it('calls createUser if existing user not found', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(null);
    createUserSpy.mockResolvedValueOnce(idirUser);
    searchContactsSpy.mockResolvedValueOnce([]);
    upsertContactsSpy.mockResolvedValueOnce({} as Contact[]);

    await userService.login(prismaTxMock, idirToken);

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(createUserSpy).toHaveBeenCalledTimes(1);
    expect(updateUserSpy).toHaveBeenCalledTimes(0);
  });

  it('calls updateUser if existing user found', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    updateUserSpy.mockResolvedValueOnce(idirUser);
    searchContactsSpy.mockResolvedValueOnce([]);

    await userService.login(prismaTxMock, idirToken);

    expect(prismaTxMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(createUserSpy).toHaveBeenCalledTimes(0);
    expect(updateUserSpy).toHaveBeenCalledTimes(1);
  });

  it('creates contact entry if not existing', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    updateUserSpy.mockResolvedValueOnce(idirUser);
    searchContactsSpy.mockResolvedValueOnce([]);
    upsertContactsSpy.mockResolvedValueOnce({} as Contact[]);

    await userService.login(prismaTxMock, idirToken);

    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(searchContactsSpy).toHaveBeenCalledTimes(1);
    expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
  });

  it('splits the BCeID first name into first/last for contact', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(bceidUser);
    updateUserSpy.mockResolvedValueOnce(bceidUser);
    searchContactsSpy.mockResolvedValueOnce([]);
    await userService.login(prismaTxMock, bceidToken);

    expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
    expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, [
      {
        contactId: expect.stringMatching(uuidv4Pattern),
        userId: bceidUser.userId as string,
        firstName: 'BCeID',
        lastName: 'User',
        email: bceidUser.email,
        phoneNumber: null,
        contactApplicantRelationship: null,
        contactPreference: null,
        createdAt: expect.any(Date),
        createdBy: expect.stringMatching(uuidv4Pattern),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      }
    ]);
  });

  it('defaults contact lastName to a single whitespace', async () => {
    const blankNameUser = { ...bceidUser };
    blankNameUser.firstName = 'Blank';
    blankNameUser.lastName = null;

    const blankToken = { ...bceidToken };
    blankToken.given_name = 'Blank';
    blankToken.family_name = null;

    prismaTxMock.user.findFirst.mockResolvedValueOnce(blankNameUser);
    updateUserSpy.mockResolvedValueOnce(blankNameUser);
    searchContactsSpy.mockResolvedValueOnce([]);

    await userService.login(prismaTxMock, blankToken);

    expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
    expect(upsertContactsSpy).toHaveBeenCalledWith(prismaTxMock, [
      {
        contactId: expect.stringMatching(uuidv4Pattern),
        userId: bceidUser.userId as string,
        firstName: 'Blank',
        lastName: ' ',
        email: bceidUser.email,
        phoneNumber: null,
        contactApplicantRelationship: null,
        contactPreference: null,
        createdAt: expect.any(Date),
        createdBy: expect.stringMatching(uuidv4Pattern),
        ...generateNullUpdateStamps(),
        ...generateNullDeleteStamps()
      }
    ]);
  });

  it('returns the user', async () => {
    prismaTxMock.user.findFirst.mockResolvedValueOnce(idirUser);
    updateUserSpy.mockResolvedValueOnce(idirUser);
    searchContactsSpy.mockResolvedValueOnce([{}] as Contact[]);
    const response = await userService.login(prismaTxMock, idirToken);

    expect(updateUserSpy).toHaveBeenCalledTimes(1);
    expect(response).toEqual(idirUser);
  });
});

describe('readIdp', () => {
  it('calls identity_provider.findUnique', async () => {
    prismaTxMock.identity_provider.findUnique.mockResolvedValueOnce(idirIdentityProvider);
    await userService.readIdp(prismaTxMock, IdentityProvider.IDIR);

    expect(prismaTxMock.identity_provider.findUnique).toHaveBeenCalledTimes(1);
  });

  it('converts prisma model to application model', async () => {
    prismaTxMock.identity_provider.findUnique.mockResolvedValueOnce(idirIdentityProvider);
    const response = await userService.readIdp(prismaTxMock, IdentityProvider.IDIR);

    expect(response).toStrictEqual(idirIdentityProvider);
  });
});

describe('readUser', () => {
  it('calls user.findUnique', async () => {
    prismaTxMock.user.findUnique.mockResolvedValueOnce(idirUser);
    await userService.readUser(prismaTxMock, idirUser.userId);

    expect(prismaTxMock.user.findUnique).toHaveBeenCalledTimes(1);
  });

  it('converts prisma model to application model', async () => {
    prismaTxMock.user.findUnique.mockResolvedValueOnce(idirUser);
    const response = await userService.readUser(prismaTxMock, idirUser.userId as string);

    expect(response).toStrictEqual(idirUser);
  });

  it('returns null if user not found', async () => {
    prismaTxMock.user.findUnique.mockResolvedValueOnce(null);
    const response = await userService.readUser(prismaTxMock, 'badId');

    expect(response).toEqual(null);
  });
});

describe('searchUsers', () => {
  it('calls user.findMany', async () => {
    prismaTxMock.user.findMany.mockResolvedValueOnce([idirUser]);
    await userService.searchUsers(prismaTxMock, { userId: [idirUser.userId as string] });

    expect(prismaTxMock.user.findMany).toHaveBeenCalledTimes(1);
  });

  it('converts prisma model to application model', async () => {
    prismaTxMock.user.findMany.mockResolvedValueOnce([idirUser]);
    const response = await userService.searchUsers(prismaTxMock, { userId: [idirUser.userId as string] });

    expect(response).toStrictEqual([idirUser]);
  });

  it('filters SYTSTEM_ID userIds', async () => {
    const systemUser: User = { ...idirUser, userId: SYSTEM_ID };
    prismaTxMock.user.findMany.mockResolvedValueOnce([systemUser]);
    const response = await userService.searchUsers(prismaTxMock, {});

    expect(response).toEqual([]);
  });
});

describe('updateUser', () => {
  it('returns same user if no data changes', async () => {
    const readUserSpy = jest.spyOn(userService, 'readUser');

    readUserSpy.mockResolvedValueOnce(idirUser);

    const response = await userService.updateUser(prismaTxMock, idirUser.userId as string, idirUser);

    expect(prismaTxMock.user.update).toHaveBeenCalledTimes(0);
    expect(response).toEqual(idirUser);
  });

  it('creates new idp if not existing', async () => {
    const readUserSpy = jest.spyOn(userService, 'readUser');
    const readIdpSpy = jest.spyOn(userService, 'readIdp');
    const createIdpSpy = jest.spyOn(userService, 'createIdp');

    readUserSpy.mockResolvedValueOnce(idirUser);
    readIdpSpy.mockResolvedValueOnce(null);

    const changedUser = { ...idirUser, firstName: 'Changed' };
    await userService.updateUser(prismaTxMock, changedUser.userId as string, changedUser);

    expect(readIdpSpy).toHaveBeenCalledTimes(1);
    expect(createIdpSpy).toHaveBeenCalledTimes(1);
  });

  it('updates the user', async () => {
    const readUserSpy = jest.spyOn(userService, 'readUser');
    const readIdpSpy = jest.spyOn(userService, 'readIdp');

    readUserSpy.mockResolvedValueOnce(idirUser);
    readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
    prismaTxMock.user.update.mockResolvedValueOnce({ ...idirUser, firstName: 'Changed' });

    const changedUser = { ...idirUser, firstName: 'Changed' };
    const response = await userService.updateUser(prismaTxMock, changedUser.userId as string, changedUser);

    expect(prismaTxMock.user.update).toHaveBeenCalledTimes(1);
    expect(response).toEqual(
      expect.objectContaining({
        ...changedUser
      })
    );
  });

  it('uses existing transaction if provided', async () => {
    const readUserSpy = jest.spyOn(userService, 'readUser');
    const readIdpSpy = jest.spyOn(userService, 'readIdp');

    readUserSpy.mockResolvedValueOnce(idirUser);
    readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
    prismaTxMock.user.update.mockResolvedValueOnce({ ...idirUser, firstName: 'Changed' });

    const changedUser = { ...idirUser, firstName: 'Changed' };

    await userService.updateUser(prismaTxMock, changedUser.userId as string, changedUser);
  });
});
