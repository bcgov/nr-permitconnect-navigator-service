import jwt from 'jsonwebtoken';
import { Prisma, user } from '@prisma/client';
import { v4 as uuidv4, NIL } from 'uuid';

import { searchContacts, upsertContacts } from './contact';
import prisma from '../db/dataConnection';
import { generateCreateStamps, generateNullUpdateStamps } from '../db/utils/utils';

import type { Contact, User } from '../types/models';
import type { UserSearchParameters } from '../types/stuff';

const trxWrapper = (etrx: Prisma.TransactionClient | undefined = undefined) => (etrx ? etrx : prisma);

/**
 * The User DB Service
 */

/**
 * An equivalent User model object without timestamp information
 */
type JwtUser = {
  active: boolean;
  bceidBusinessName: string | null;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
  idp: string | null;
  lastName: string | null;
  sub: string;
};

/**
 * @function _tokenToUser
 * Transforms JWT payload contents into a User Model object
 * Checks IDIR/BCeID keys first, fallbacks are for BCSC
 * @param {object} token The decoded JWT payload
 * @returns {object} An equivalent User model object
 */
const _tokenToUser = (token: jwt.JwtPayload): JwtUser => {
  return {
    bceidBusinessName: token.bceid_business_name,
    sub: token.sub ? token.sub : token.preferred_username,
    firstName: token.given_name ?? token.given_names,
    fullName: token.name ?? token.display_name,
    lastName: token.family_name,
    email: token.email,
    idp: token.identity_provider,
    active: true
  };
};

/**
 * @function createIdp
 * Create an identity provider record
 * @param {string} idp The identity provider code
 * @param {object} [etrx=undefined] An optional Prisma Transaction object
 * @returns {Promise<object>} The result of running the insert operation
 * @throws The error encountered upon db transaction failure
 */
const createIdp = async (idp: string, etrx: Prisma.TransactionClient | undefined = undefined) => {
  const obj = {
    idp: idp,
    active: true,
    createdBy: NIL
  };

  const response = trxWrapper(etrx).identity_provider.create({ data: obj });

  return response;
};

/**
 * @function createUser
 * Create a user DB record
 * @param {object} data Incoming user data
 * @param {object} [etrx=undefined] An optional Prisma Transaction object
 * @returns {Promise<object>} The result of running the insert operation
 * @throws The error encountered upon db transaction failure
 */
export const createUser = async (data: JwtUser, etrx: Prisma.TransactionClient | undefined = undefined) => {
  let response: User | undefined;

  // Logical function
  const _createUser = async (data: JwtUser, trx: Prisma.TransactionClient) => {
    const exists = await trx.user.findFirst({
      where: {
        sub: data.sub
      }
    });

    if (exists) {
      response = exists;
    } else {
      if (data.idp) {
        const identityProvider = await readIdp(data.idp, trx);
        if (!identityProvider) await createIdp(data.idp, trx);
      }

      const newUser = {
        bceidBusinessName: data.bceidBusinessName,
        userId: uuidv4(),
        sub: data.sub,
        fullName: data.fullName,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        idp: data.idp,
        active: true,
        ...generateCreateStamps(undefined)
      };

      const createResponse = await trx.user.create({
        data: newUser
      });

      // TS hiccuping on the internal function
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      response = createResponse;
    }
  };

  // Call with proper transaction
  if (etrx) {
    await _createUser(data, etrx);
  } else {
    await prisma.$transaction(async (trx) => {
      await _createUser(data, trx);
    });
  }

  return response;
};

/**
 * @function getCurrentUserId
 * Gets userId (primary identifier of a user in db) of currentContext.
 * @param {object} sub The subject of the current user
 * @param {string} [defaultValue=undefined] An optional default return value
 * @returns {string} The current userId if applicable, or `defaultValue`
 */
export const getCurrentUserId = async (sub: string, defaultValue: string | undefined = undefined) => {
  const user = await prisma.user.findFirst({
    where: {
      sub: sub
    }
  });

  return user && user.userId ? user.userId : defaultValue;
};

/**
 * @function listIdps
 * Lists all known identity providers
 * @param {boolean} [active] Boolean on identity_provider active status
 * @returns {Promise<object>} The result of running the find operation
 */
export const listIdps = async (active: boolean) => {
  return prisma.identity_provider.findMany({
    where: {
      active: active
    }
  });
};

/**
 * @function login
 * Parse the user token and update the user table if necessary
 * Create a contact entry if necessary
 * @param {object} token The decoded JWT token payload
 * @returns {Promise<object>} The result of running the login operation
 */
export const login = async (token: jwt.JwtPayload) => {
  const newUser = _tokenToUser(token);

  const response: User | undefined | null = await prisma.$transaction(async (trx) => {
    const oldUser = await trx.user.findFirst({
      where: {
        sub: newUser.sub
      }
    });
    if (!oldUser) {
      return await createUser(newUser, trx);
    } else {
      return await updateUser(oldUser.userId, newUser, trx);
    }
  });

  // Create initial contact entry
  if (response) {
    const oldContact: Array<Contact> = await searchContacts({
      userId: [response.userId as string]
    });
    if (!oldContact.length) {
      const newContact: Contact = {
        contactId: uuidv4(),
        userId: response.userId as string,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: null,
        contactApplicantRelationship: null,
        contactPreference: null,
        ...generateCreateStamps(undefined),
        ...generateNullUpdateStamps()
      };
      await upsertContacts([newContact]);
    }
  }

  return response;
};

/**
 * @function readIdp
 * Gets an identity provider record
 * @param {string} code The identity provider code
 * @param {object} [etrx=undefined] An optional Prisma Transaction object
 * @returns {Promise<object>} The result of running the find operation
 * @throws The error encountered upon db transaction failure
 */
const readIdp = async (code: string, etrx: Prisma.TransactionClient | undefined = undefined) => {
  const response = await trxWrapper(etrx).identity_provider.findUnique({
    where: {
      idp: code
    }
  });

  return response;
};

/**
 * @function readUser
 * Gets a user record
 * @param {string} userId The userId uuid
 * @returns {Promise<object>} The result of running the find operation
 * @throws If no record is found
 */
export const readUser = async (userId: string) => {
  const response = await prisma.user.findUnique({
    where: {
      userId
    }
  });

  return response;
};

/**
 * @function searchUsers
 * Search and filter for specific users
 * @param {string[]} [params.userId] Optional array of uuids representing the user subject
 * @param {string[]} [params.idp] Optional array of identity providers
 * @param {string} [params.sub] Optional sub string to match on
 * @param {string} [params.email] Optional email string to match on
 * @param {string} [params.firstName] Optional firstName string to match on
 * @param {string} [params.fullName] Optional fullName string to match on
 * @param {string} [params.lastName] Optional lastName string to match on
 * @param {boolean} [params.active] Optional boolean on user active status
 * @returns {Promise<object>} The result of running the find operation
 */
export const searchUsers = async (params: UserSearchParameters): Promise<user[]> => {
  const response = await prisma.user.findMany({
    where: {
      AND: [
        {
          userId: { in: params.userId }
        },
        {
          idp: { in: params.idp, mode: 'insensitive' }
        },
        {
          sub: { contains: params.sub, mode: 'insensitive' }
        },
        {
          email: { contains: params.email, mode: 'insensitive' }
        },
        {
          firstName: { contains: params.firstName, mode: 'insensitive' }
        },
        {
          fullName: { contains: params.fullName, mode: 'insensitive' }
        },
        {
          lastName: { contains: params.lastName, mode: 'insensitive' }
        },
        {
          active: params.active
        }
      ]
    }
  });

  return response.filter((x) => x.userId !== NIL);
};

/**
 * @function updateUser
 * Updates a user record only if there are changed values
 * @param {string} userId The userId uuid
 * @param {object} data Incoming user data
 * @param {object} [etrx=undefined] An optional Prisma Transaction object
 * @returns {Promise<object>} The result of running the patch operation
 * @throws The error encountered upon db transaction failure
 */
const updateUser = async (userId: string, data: JwtUser, etrx: Prisma.TransactionClient | undefined = undefined) => {
  // Check if any user values have changed
  const oldUser = await readUser(userId);
  const diff = Object.entries(data).some(([key, value]) => oldUser && oldUser[key as keyof JwtUser] !== value);

  let response: User | undefined;

  if (diff) {
    const _updateUser = async (
      userId: string,
      data: JwtUser,
      trx: Prisma.TransactionClient | undefined = undefined
    ) => {
      // Patch existing user
      if (data.idp) {
        const identityProvider = await readIdp(data.idp, trx);
        if (!identityProvider) await createIdp(data.idp, trx);
      }

      const obj = {
        bceidBusinessName: data.bceidBusinessName,
        sub: data.sub,
        fullName: data.fullName,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        idp: data.idp,
        active: data.active
      };

      // TODO: Add support for updating userId primary key in the event it changes
      const updateResponse = await trx?.user.update({
        data: obj,
        where: {
          userId
        }
      });

      if (updateResponse) response = updateResponse;
    };

    // Call with proper transaction
    if (etrx) {
      await _updateUser(userId, data, etrx);
    } else {
      await prisma.$transaction(async (tx) => {
        // TODO: Address incorect typing, see github issue - https://github.com/prisma/prisma/issues/20738
        await _updateUser(userId, data, tx);
      });
    }

    return response;
  } else {
    // Nothing to update
    return oldUser;
  }
};
