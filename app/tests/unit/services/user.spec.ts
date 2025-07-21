import { NIL, v4 as uuidv4 } from 'uuid';

import { Prisma } from '@prisma/client';
import { contactService, userService } from '../../../src/services';
import { prismaMock } from '../../__mocks__/prismaMock';
import { IdentityProvider } from '../../../src/utils/enums/application';

import type { IdentityProvider as IDPType, User } from '../../../src/types';

const uuidv4Pattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

const _identity_provider = Prisma.validator<Prisma.identity_providerDefaultArgs>()({});
type PrismaIdentityProvider = Prisma.identity_providerGetPayload<typeof _identity_provider>;

const _user = Prisma.validator<Prisma.userDefaultArgs>()({});
type PrismaUser = Prisma.userGetPayload<typeof _user>;

const prismaIdirIdentityProvider: PrismaIdentityProvider = {
  idp: IdentityProvider.IDIR,
  active: true,
  created_at: new Date(),
  created_by: NIL,
  updated_at: null,
  updated_by: null
};

const idirIdentityProvider: IDPType = {
  idp: IdentityProvider.IDIR,
  active: true
};

const prismaBceidUser: PrismaUser = {
  bceid_business_name: null,
  user_id: uuidv4(),
  idp: IdentityProvider.BCEID,
  sub: 'sub',
  email: 'test@email.com',
  first_name: 'BCeID User',
  full_name: 'BCeID User',
  last_name: null,
  active: true,
  created_at: new Date(),
  created_by: NIL,
  updated_at: null,
  updated_by: null
};

const bceidUser: User = {
  bceidBusinessName: null,
  userId: prismaBceidUser.user_id,
  idp: prismaBceidUser.idp,
  sub: prismaBceidUser.sub,
  email: prismaBceidUser.email,
  firstName: prismaBceidUser.first_name,
  fullName: prismaBceidUser.full_name,
  lastName: prismaBceidUser.last_name,
  active: prismaBceidUser.active
};

const prismaIdirUser: PrismaUser = {
  bceid_business_name: null,
  user_id: uuidv4(),
  idp: IdentityProvider.IDIR,
  sub: 'sub',
  email: 'test@email.com',
  first_name: 'Test',
  full_name: 'Test User',
  last_name: 'User',
  active: true,
  created_at: new Date(),
  created_by: NIL,
  updated_at: null,
  updated_by: null
};

const idirUser: User = {
  bceidBusinessName: null,
  userId: prismaIdirUser.user_id,
  idp: prismaIdirUser.idp,
  sub: prismaIdirUser.sub,
  email: prismaIdirUser.email,
  firstName: prismaIdirUser.first_name,
  fullName: prismaIdirUser.full_name,
  lastName: prismaIdirUser.last_name,
  active: prismaIdirUser.active
};

const bceidToken = {
  sub: prismaBceidUser.sub,
  given_name: prismaBceidUser.first_name,
  name: prismaBceidUser.full_name,
  family_name: prismaBceidUser.last_name,
  email: prismaBceidUser.email,
  identity_provider: prismaBceidUser.idp
};

const idirToken = {
  sub: prismaIdirUser.sub,
  given_name: prismaIdirUser.first_name,
  name: prismaIdirUser.full_name,
  family_name: prismaIdirUser.last_name,
  email: prismaIdirUser.email,
  identity_provider: prismaIdirUser.idp
};

describe('user service', () => {
  beforeEach(() => {
    prismaMock.$transaction.mockImplementation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (callback: any) => callback(prismaMock)
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe('createIdp', () => {
    it('creates the idp', async () => {
      prismaMock.identity_provider.create.mockResolvedValueOnce(prismaIdirIdentityProvider);
      const response = await userService.createIdp(IdentityProvider.IDIR);

      expect(prismaMock.identity_provider.create).toHaveBeenCalledTimes(1);
      expect(response).toEqual(prismaIdirIdentityProvider);
    });
  });

  describe('createUser', () => {
    it('searches for and returns an existing user', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      const response = await userService.createUser(idirUser);

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(response).toEqual(idirUser);
    });

    it('creates new idp if not existing', async () => {
      const readIdpSpy = jest.spyOn(userService, 'readIdp');
      const createIdpSpy = jest.spyOn(userService, 'createIdp');

      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      readIdpSpy.mockResolvedValueOnce(null);
      prismaMock.user.create.mockResolvedValueOnce(prismaIdirUser);

      await userService.createUser({ ...idirUser, userId: undefined });

      expect(readIdpSpy).toHaveBeenCalledTimes(1);
      expect(createIdpSpy).toHaveBeenCalledTimes(1);
    });

    it('creates new user if not existing', async () => {
      const readIdpSpy = jest.spyOn(userService, 'readIdp');
      const createIdpSpy = jest.spyOn(userService, 'createIdp');

      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
      prismaMock.user.create.mockResolvedValueOnce(prismaIdirUser);

      const response = await userService.createUser({ ...idirUser, userId: undefined });

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(readIdpSpy).toHaveBeenCalledTimes(1);
      expect(createIdpSpy).toHaveBeenCalledTimes(0);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
      expect(response).toEqual(
        expect.objectContaining({
          ...idirUser,
          userId: expect.stringMatching(uuidv4Pattern)
        })
      );
    });

    it('uses existing transaction if provided', async () => {
      const readIdpSpy = jest.spyOn(userService, 'readIdp');

      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
      prismaMock.user.create.mockResolvedValueOnce(prismaIdirUser);

      await prismaMock.$transaction(async (trx) => {
        await userService.createUser({ ...idirUser, userId: undefined }, trx);
      });

      // This is a bit jank - have to add 1 for the prismaMock.$transaction in this test itself
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCurrentUserId', () => {
    it('should return user id if found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      const response = await userService.getCurrentUserId('sub');

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(response).toEqual(prismaIdirUser.user_id);
    });

    it('should return defaultValue if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      const response = await userService.getCurrentUserId('test');

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(response).toEqual(undefined);
    });
  });

  describe('listIdps', () => {
    it('calls identity_provider.findMany', async () => {
      prismaMock.identity_provider.findMany.mockResolvedValueOnce([prismaIdirIdentityProvider]);
      const response = await userService.listIdps(true);

      expect(prismaMock.identity_provider.findMany).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual([prismaIdirIdentityProvider]);
    });
  });

  describe('login', () => {
    it('searches for and returns an existing user', async () => {
      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      await userService.login(idirToken);

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
    });

    it('calls createUser if existing user not found', async () => {
      const createUserSpy = jest.spyOn(userService, 'createUser');
      const updateUserSpy = jest.spyOn(userService, 'updateUser');

      prismaMock.user.findFirst.mockResolvedValueOnce(null);
      createUserSpy.mockResolvedValueOnce(idirUser);
      await userService.login(idirToken);

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledTimes(1);
      expect(updateUserSpy).toHaveBeenCalledTimes(0);
    });

    it('calls updateUser if existing user found', async () => {
      const createUserSpy = jest.spyOn(userService, 'createUser');
      const updateUserSpy = jest.spyOn(userService, 'updateUser');

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      updateUserSpy.mockResolvedValueOnce(idirUser);
      await userService.login(idirToken);

      expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
      expect(createUserSpy).toHaveBeenCalledTimes(0);
      expect(updateUserSpy).toHaveBeenCalledTimes(1);
    });

    it('creates contact entry if not existing', async () => {
      const updateUserSpy = jest.spyOn(userService, 'updateUser');
      const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
      const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      updateUserSpy.mockResolvedValueOnce(idirUser);
      await userService.login(idirToken);

      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
    });

    it('does not create contact if user returns nothing', async () => {
      const updateUserSpy = jest.spyOn(userService, 'updateUser');
      const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
      const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      updateUserSpy.mockResolvedValueOnce(null);
      await userService.login(idirToken);

      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(searchContactsSpy).toHaveBeenCalledTimes(0);
      expect(upsertContactsSpy).toHaveBeenCalledTimes(0);
    });

    it('splits the BCeID first name into first/last for contact', async () => {
      const updateUserSpy = jest.spyOn(userService, 'updateUser');
      const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaBceidUser);
      updateUserSpy.mockResolvedValueOnce(bceidUser);
      await userService.login(bceidToken);

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith(
        [
          {
            contactId: expect.stringMatching(uuidv4Pattern),
            userId: bceidUser.userId as string,
            firstName: 'BCeID',
            lastName: 'User',
            email: bceidUser.email,
            phoneNumber: null,
            contactApplicantRelationship: null,
            contactPreference: null
          }
        ],
        { userId: bceidUser.userId }
      );
    });

    it('defaults contact lastName to a single whitespace', async () => {
      const updateUserSpy = jest.spyOn(userService, 'updateUser');
      const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

      const prismaBlankNameUser = { ...prismaBceidUser };
      prismaBlankNameUser.first_name = 'Blank';
      prismaBlankNameUser.last_name = null;

      const blankNameUser = { ...bceidUser };
      blankNameUser.firstName = 'Blank';
      blankNameUser.lastName = null;

      const blankToken = { ...bceidToken };
      blankToken.given_name = 'Blank';
      blankToken.family_name = null;

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaBlankNameUser);
      updateUserSpy.mockResolvedValueOnce(blankNameUser);
      await userService.login(blankToken);

      expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
      expect(upsertContactsSpy).toHaveBeenCalledWith(
        [
          {
            contactId: expect.stringMatching(uuidv4Pattern),
            userId: bceidUser.userId as string,
            firstName: 'Blank',
            lastName: ' ',
            email: bceidUser.email,
            phoneNumber: null,
            contactApplicantRelationship: null,
            contactPreference: null
          }
        ],
        { userId: bceidUser.userId }
      );
    });

    it('returns the user', async () => {
      const updateUserSpy = jest.spyOn(userService, 'updateUser');

      prismaMock.user.findFirst.mockResolvedValueOnce(prismaIdirUser);
      updateUserSpy.mockResolvedValueOnce(idirUser);
      const response = await userService.login(idirToken);

      expect(updateUserSpy).toHaveBeenCalledTimes(1);
      expect(response).toEqual(idirUser);
    });
  });

  describe('readIdp', () => {
    it('calls identity_provider.findUnique', async () => {
      prismaMock.identity_provider.findUnique.mockResolvedValueOnce(prismaIdirIdentityProvider);
      await userService.readIdp(IdentityProvider.IDIR);

      expect(prismaMock.identity_provider.findUnique).toHaveBeenCalledTimes(1);
    });

    it('converts prisma model to application model', async () => {
      prismaMock.identity_provider.findUnique.mockResolvedValueOnce(prismaIdirIdentityProvider);
      const response = await userService.readIdp(IdentityProvider.IDIR);

      expect(response).toStrictEqual(idirIdentityProvider);
    });
  });

  describe('readUser', () => {
    it('calls user.findUnique', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaIdirUser);
      await userService.readUser(idirUser.userId as string);

      expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    });

    it('converts prisma model to application model', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(prismaIdirUser);
      const response = await userService.readUser(idirUser.userId as string);

      expect(response).toStrictEqual(idirUser);
    });

    it('returns null if user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce(null);
      const response = await userService.readUser('badId');

      expect(response).toEqual(null);
    });
  });

  describe('searchUsers', () => {
    it('calls user.findMany', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([prismaIdirUser]);
      await userService.searchUsers({ userId: [idirUser.userId as string] });

      expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
    });

    it('converts prisma model to application model', async () => {
      prismaMock.user.findMany.mockResolvedValueOnce([prismaIdirUser]);
      const response = await userService.searchUsers({ userId: [idirUser.userId as string] });

      expect(response).toStrictEqual([idirUser]);
    });

    it('filters NIL userIds', async () => {
      const nilUser: PrismaUser = { ...prismaIdirUser, user_id: NIL };
      prismaMock.user.findMany.mockResolvedValueOnce([nilUser]);
      const response = await userService.searchUsers({});

      expect(response).toEqual([]);
    });
  });

  describe('updateUser', () => {
    it('returns same user if no data changes', async () => {
      const readUserSpy = jest.spyOn(userService, 'readUser');

      readUserSpy.mockResolvedValueOnce(idirUser);

      const response = await userService.updateUser(idirUser.userId as string, idirUser);

      expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
      expect(response).toEqual(idirUser);
    });

    it('creates new idp if not existing', async () => {
      const readUserSpy = jest.spyOn(userService, 'readUser');
      const readIdpSpy = jest.spyOn(userService, 'readIdp');
      const createIdpSpy = jest.spyOn(userService, 'createIdp');

      readUserSpy.mockResolvedValueOnce(idirUser);
      readIdpSpy.mockResolvedValueOnce(null);

      const changedUser = { ...idirUser, firstName: 'Changed' };
      await userService.updateUser(changedUser.userId as string, changedUser);

      expect(readIdpSpy).toHaveBeenCalledTimes(1);
      expect(createIdpSpy).toHaveBeenCalledTimes(1);
    });

    it('updates the user', async () => {
      const readUserSpy = jest.spyOn(userService, 'readUser');
      const readIdpSpy = jest.spyOn(userService, 'readIdp');

      readUserSpy.mockResolvedValueOnce(idirUser);
      readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
      prismaMock.user.update.mockResolvedValueOnce({ ...prismaIdirUser, first_name: 'Changed' });

      const changedUser = { ...idirUser, firstName: 'Changed' };
      const response = await userService.updateUser(changedUser.userId as string, changedUser);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
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
      prismaMock.user.update.mockResolvedValueOnce({ ...prismaIdirUser, first_name: 'Changed' });

      const changedUser = { ...idirUser, firstName: 'Changed' };

      await prismaMock.$transaction(async (trx) => {
        await userService.updateUser(changedUser.userId as string, changedUser, trx);
      });

      // This is a bit jank - have to add 1 for the prismaMock.$transaction in this test itself
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    });
  });
});
