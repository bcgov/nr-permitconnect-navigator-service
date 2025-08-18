// import { NIL, v4 as uuidv4 } from 'uuid';

// import * as contactService from '../../../src/services/contact';
// import * as userService from '../../../src/services/user';
// import { prismaMock } from '../../__mocks__/prismaMock';
// import { IdentityProvider } from '../../../src/utils/enums/application';

// import type { IdentityProvider as IDPType, User } from '../../../src/types';
// import { uuidv4Pattern } from '../../../src/utils/regexp';

// const idirIdentityProvider: IDPType = {
//   idp: IdentityProvider.IDIR,
//   active: true,
//   createdAt: new Date(),
//   createdBy: NIL,
//   updatedAt: null,
//   updatedBy: null
// };

// const bceidUser: User = {
//   bceidBusinessName: null,
//   userId: uuidv4(),
//   idp: IdentityProvider.BCEID,
//   sub: 'sub',
//   email: 'test@email.com',
//   firstName: 'BCeID User',
//   fullName: 'BCeID User',
//   lastName: null,
//   active: true,
//   createdAt: new Date(),
//   createdBy: NIL,
//   updatedAt: null,
//   updatedBy: null
// };

// const idirUser: User = {
//   bceidBusinessName: null,
//   userId: uuidv4(),
//   idp: IdentityProvider.IDIR,
//   sub: 'sub',
//   email: 'test@email.com',
//   firstName: 'Test',
//   fullName: 'Test User',
//   lastName: 'User',
//   active: true,
//   createdAt: new Date(),
//   createdBy: NIL,
//   updatedAt: null,
//   updatedBy: null
// };

// const bceidToken = {
//   sub: bceidUser.sub,
//   given_name: bceidUser.firstName,
//   name: bceidUser.fullName,
//   family_name: bceidUser.lastName,
//   email: bceidUser.email,
//   identity_provider: bceidUser.idp
// };

// const idirToken = {
//   sub: idirUser.sub,
//   given_name: idirUser.firstName,
//   name: idirUser.fullName,
//   family_name: idirUser.lastName,
//   email: idirUser.email,
//   identity_provider: idirUser.idp
// };

// describe('user service', () => {
//   beforeEach(() => {
//     prismaMock.$transaction.mockImplementation(
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       (callback: any) => callback(prismaMock)
//     );
//   });

//   afterEach(() => {
//     jest.resetAllMocks();
//     jest.restoreAllMocks();
//   });

//   describe('createIdp', () => {
//     it('creates the idp', async () => {
//       prismaMock.identity_provider.create.mockResolvedValueOnce(idirIdentityProvider);
//       const response = await userService.createIdp(IdentityProvider.IDIR);

//       expect(prismaMock.identity_provider.create).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(idirIdentityProvider);
//     });
//   });

//   describe('createUser', () => {
//     it('searches for and returns an existing user', async () => {
//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       const response = await userService.createUser(idirUser);

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(idirUser);
//     });

//     it('creates new idp if not existing', async () => {
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');
//       const createIdpSpy = jest.spyOn(userService, 'createIdp');

//       prismaMock.user.findFirst.mockResolvedValueOnce(null);
//       readIdpSpy.mockResolvedValueOnce(null);
//       prismaMock.user.create.mockResolvedValueOnce(idirUser);

//       await userService.createUser({ ...idirUser, userId: undefined });

//       expect(readIdpSpy).toHaveBeenCalledTimes(1);
//       expect(createIdpSpy).toHaveBeenCalledTimes(1);
//     });

//     it('creates new user if not existing', async () => {
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');
//       const createIdpSpy = jest.spyOn(userService, 'createIdp');

//       prismaMock.user.findFirst.mockResolvedValueOnce(null);
//       readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
//       prismaMock.user.create.mockResolvedValueOnce(idirUser);

//       const response = await userService.createUser({ ...idirUser, userId: undefined });

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(readIdpSpy).toHaveBeenCalledTimes(1);
//       expect(createIdpSpy).toHaveBeenCalledTimes(0);
//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
//       expect(prismaMock.user.create).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(
//         expect.objectContaining({
//           ...idirUser,
//           userId: expect.stringMatching(uuidv4Pattern)
//         })
//       );
//     });

//     it('uses existing transaction if provided', async () => {
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');

//       prismaMock.user.findFirst.mockResolvedValueOnce(null);
//       readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
//       prismaMock.user.create.mockResolvedValueOnce(idirUser);

//       await prismaMock.$transaction(async (trx) => {
//         await userService.createUser({ ...idirUser, userId: undefined }, trx);
//       });

//       // This is a bit jank - have to add 1 for the prismaMock.$transaction in this test itself
//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
//     });
//   });

//   describe('getCurrentUserId', () => {
//     it('should return user id if found', async () => {
//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       const response = await userService.getCurrentUserId('sub');

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(idirUser.user_id);
//     });

//     it('should return defaultValue if user not found', async () => {
//       prismaMock.user.findFirst.mockResolvedValueOnce(null);
//       const response = await userService.getCurrentUserId('test');

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(undefined);
//     });
//   });

//   describe('listIdps', () => {
//     it('calls identity_provider.findMany', async () => {
//       prismaMock.identity_provider.findMany.mockResolvedValueOnce([idirIdentityProvider]);
//       const response = await userService.listIdps(true);

//       expect(prismaMock.identity_provider.findMany).toHaveBeenCalledTimes(1);
//       expect(response).toStrictEqual([idirIdentityProvider]);
//     });
//   });

//   describe('login', () => {
//     it('searches for and returns an existing user', async () => {
//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       await userService.login(idirToken);

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//     });

//     it('calls createUser if existing user not found', async () => {
//       const createUserSpy = jest.spyOn(userService, 'createUser');
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');

//       prismaMock.user.findFirst.mockResolvedValueOnce(null);
//       createUserSpy.mockResolvedValueOnce(idirUser);
//       await userService.login(idirToken);

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(createUserSpy).toHaveBeenCalledTimes(1);
//       expect(updateUserSpy).toHaveBeenCalledTimes(0);
//     });

//     it('calls updateUser if existing user found', async () => {
//       const createUserSpy = jest.spyOn(userService, 'createUser');
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');

//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       updateUserSpy.mockResolvedValueOnce(idirUser);
//       await userService.login(idirToken);

//       expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
//       expect(createUserSpy).toHaveBeenCalledTimes(0);
//       expect(updateUserSpy).toHaveBeenCalledTimes(1);
//     });

//     it('creates contact entry if not existing', async () => {
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');
//       const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
//       const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       updateUserSpy.mockResolvedValueOnce(idirUser);
//       await userService.login(idirToken);

//       expect(updateUserSpy).toHaveBeenCalledTimes(1);
//       expect(searchContactsSpy).toHaveBeenCalledTimes(1);
//       expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
//     });

//     it('does not create contact if user returns nothing', async () => {
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');
//       const searchContactsSpy = jest.spyOn(contactService, 'searchContacts');
//       const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       updateUserSpy.mockResolvedValueOnce(null);
//       await userService.login(idirToken);

//       expect(updateUserSpy).toHaveBeenCalledTimes(1);
//       expect(searchContactsSpy).toHaveBeenCalledTimes(0);
//       expect(upsertContactsSpy).toHaveBeenCalledTimes(0);
//     });

//     it('splits the BCeID first name into first/last for contact', async () => {
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');
//       const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

//       prismaMock.user.findFirst.mockResolvedValueOnce(bceidUser);
//       updateUserSpy.mockResolvedValueOnce(bceidUser);
//       await userService.login(bceidToken);

//       expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
//       expect(upsertContactsSpy).toHaveBeenCalledWith(
//         [
//           {
//             contactId: expect.stringMatching(uuidv4Pattern),
//             userId: bceidUser.userId as string,
//             firstName: 'BCeID',
//             lastName: 'User',
//             email: bceidUser.email,
//             phoneNumber: null,
//             contactApplicantRelationship: null,
//             contactPreference: null
//           }
//         ],
//         { userId: bceidUser.userId }
//       );
//     });

//     it('defaults contact lastName to a single whitespace', async () => {
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');
//       const upsertContactsSpy = jest.spyOn(contactService, 'upsertContacts');

//       const blankNameUser = { ...bceidUser };
//       blankNameUser.firstName = 'Blank';
//       blankNameUser.lastName = null;

//       const blankToken = { ...bceidToken };
//       blankToken.given_name = 'Blank';
//       blankToken.family_name = null;

//       prismaMock.user.findFirst.mockResolvedValueOnce(blankNameUser);
//       updateUserSpy.mockResolvedValueOnce(blankNameUser);
//       await userService.login(blankToken);

//       expect(upsertContactsSpy).toHaveBeenCalledTimes(1);
//       expect(upsertContactsSpy).toHaveBeenCalledWith(
//         [
//           {
//             contactId: expect.stringMatching(uuidv4Pattern),
//             userId: bceidUser.userId as string,
//             firstName: 'Blank',
//             lastName: ' ',
//             email: bceidUser.email,
//             phoneNumber: null,
//             contactApplicantRelationship: null,
//             contactPreference: null
//           }
//         ],
//         { userId: bceidUser.userId }
//       );
//     });

//     it('returns the user', async () => {
//       const updateUserSpy = jest.spyOn(userService, 'updateUser');

//       prismaMock.user.findFirst.mockResolvedValueOnce(idirUser);
//       updateUserSpy.mockResolvedValueOnce(idirUser);
//       const response = await userService.login(idirToken);

//       expect(updateUserSpy).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(idirUser);
//     });
//   });

//   describe('readIdp', () => {
//     it('calls identity_provider.findUnique', async () => {
//       prismaMock.identity_provider.findUnique.mockResolvedValueOnce(idirIdentityProvider);
//       await userService.readIdp(IdentityProvider.IDIR);

//       expect(prismaMock.identity_provider.findUnique).toHaveBeenCalledTimes(1);
//     });

//     it('converts prisma model to application model', async () => {
//       prismaMock.identity_provider.findUnique.mockResolvedValueOnce(idirIdentityProvider);
//       const response = await userService.readIdp(IdentityProvider.IDIR);

//       expect(response).toStrictEqual(idirIdentityProvider);
//     });
//   });

//   describe('readUser', () => {
//     it('calls user.findUnique', async () => {
//       prismaMock.user.findUnique.mockResolvedValueOnce(idirUser);
//       await userService.readUser(idirUser.userId as string);

//       expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
//     });

//     it('converts prisma model to application model', async () => {
//       prismaMock.user.findUnique.mockResolvedValueOnce(idirUser);
//       const response = await userService.readUser(idirUser.userId as string);

//       expect(response).toStrictEqual(idirUser);
//     });

//     it('returns null if user not found', async () => {
//       prismaMock.user.findUnique.mockResolvedValueOnce(null);
//       const response = await userService.readUser('badId');

//       expect(response).toEqual(null);
//     });
//   });

//   describe('searchUsers', () => {
//     it('calls user.findMany', async () => {
//       prismaMock.user.findMany.mockResolvedValueOnce([idirUser]);
//       await userService.searchUsers({ userId: [idirUser.userId as string] });

//       expect(prismaMock.user.findMany).toHaveBeenCalledTimes(1);
//     });

//     it('converts prisma model to application model', async () => {
//       prismaMock.user.findMany.mockResolvedValueOnce([idirUser]);
//       const response = await userService.searchUsers({ userId: [idirUser.userId as string] });

//       expect(response).toStrictEqual([idirUser]);
//     });

//     it('filters NIL userIds', async () => {
//       const nilUser: PrismaUser = { ...idirUser, user_id: NIL };
//       prismaMock.user.findMany.mockResolvedValueOnce([nilUser]);
//       const response = await userService.searchUsers({});

//       expect(response).toEqual([]);
//     });
//   });

//   describe('updateUser', () => {
//     it('returns same user if no data changes', async () => {
//       const readUserSpy = jest.spyOn(userService, 'readUser');

//       readUserSpy.mockResolvedValueOnce(idirUser);

//       const response = await userService.updateUser(idirUser.userId as string, idirUser);

//       expect(prismaMock.user.update).toHaveBeenCalledTimes(0);
//       expect(response).toEqual(idirUser);
//     });

//     it('creates new idp if not existing', async () => {
//       const readUserSpy = jest.spyOn(userService, 'readUser');
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');
//       const createIdpSpy = jest.spyOn(userService, 'createIdp');

//       readUserSpy.mockResolvedValueOnce(idirUser);
//       readIdpSpy.mockResolvedValueOnce(null);

//       const changedUser = { ...idirUser, firstName: 'Changed' };
//       await userService.updateUser(changedUser.userId as string, changedUser);

//       expect(readIdpSpy).toHaveBeenCalledTimes(1);
//       expect(createIdpSpy).toHaveBeenCalledTimes(1);
//     });

//     it('updates the user', async () => {
//       const readUserSpy = jest.spyOn(userService, 'readUser');
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');

//       readUserSpy.mockResolvedValueOnce(idirUser);
//       readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
//       prismaMock.user.update.mockResolvedValueOnce({ ...idirUser, first_name: 'Changed' });

//       const changedUser = { ...idirUser, firstName: 'Changed' };
//       const response = await userService.updateUser(changedUser.userId as string, changedUser);

//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
//       expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
//       expect(response).toEqual(
//         expect.objectContaining({
//           ...changedUser
//         })
//       );
//     });

//     it('uses existing transaction if provided', async () => {
//       const readUserSpy = jest.spyOn(userService, 'readUser');
//       const readIdpSpy = jest.spyOn(userService, 'readIdp');

//       readUserSpy.mockResolvedValueOnce(idirUser);
//       readIdpSpy.mockResolvedValueOnce(idirIdentityProvider);
//       prismaMock.user.update.mockResolvedValueOnce({ ...idirUser, first_name: 'Changed' });

//       const changedUser = { ...idirUser, firstName: 'Changed' };

//       await prismaMock.$transaction(async (trx) => {
//         await userService.updateUser(changedUser.userId as string, changedUser, trx);
//       });

//       // This is a bit jank - have to add 1 for the prismaMock.$transaction in this test itself
//       expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
//     });
//   });
// });
