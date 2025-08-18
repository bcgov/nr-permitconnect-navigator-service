import jwt from 'jsonwebtoken';
import { v4 as uuidv4, NIL } from 'uuid';

import { searchContacts, upsertContacts } from './contact';
import { generateCreateStamps, generateNullUpdateStamps } from '../db/utils/utils';

import type { PrismaTransactionClient } from '../db/dataConnection';
import type { Contact, IdentityProvider, User } from '../types/models';
import type { UserSearchParameters } from '../types/stuff';
import { Problem } from '../utils';

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
 * @param token The decoded JWT payload
 * @returns An equivalent User model object
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
 * Create an identity provider record
 * @param tx Prisma transaction client
 * @param idp The identity provider code
 * @returns A Promise that resolves into the created identity provider
 */
const createIdp = async (tx: PrismaTransactionClient, idp: string): Promise<IdentityProvider> => {
  const obj = {
    idp: idp,
    active: true,
    createdBy: NIL
  };

  const response = tx.identity_provider.create({ data: obj });

  return response;
};

/**
 * Create a user DB record
 * @param tx Prisma transaction client
 * @param data Incoming user data
 * @returns A Promise that resolves into the created user
 */
export const createUser = async (tx: PrismaTransactionClient, data: JwtUser): Promise<User> => {
  // Logical function
  const _createUser = async (tx: PrismaTransactionClient, data: JwtUser): Promise<User> => {
    const exists = await tx.user.findFirst({
      where: {
        sub: data.sub
      }
    });

    if (exists) {
      return exists;
    } else {
      if (data.idp) {
        const identityProvider = await readIdp(tx, data.idp);
        if (!identityProvider) await createIdp(tx, data.idp);
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

      return await tx.user.create({
        data: newUser
      });
    }
  };

  return _createUser(tx, data);
};

/**
 * Gets userId (primary identifier of a user in db) of currentContext.
 * @param tx Prisma transaction client
 * @param sub The subject of the current user
 * @param defaultValue Optional default return value. Defaults to `undefined`
 * @returns A Promise that resolves to the current userId if applicable, or `defaultValue`
 */
export const getCurrentUserId = async (
  tx: PrismaTransactionClient,
  sub: string,
  defaultValue: string | undefined = undefined
): Promise<string | undefined> => {
  const user = await tx.user.findFirst({
    where: {
      sub: sub
    }
  });

  return user && user.userId ? user.userId : defaultValue;
};

/**
 * Lists all known identity providers
 * @param tx Prisma transaction client
 * @param active Boolean on identity_provider active status
 * @returns A Promise that resolves to an array of identity providers
 */
export const listIdps = async (tx: PrismaTransactionClient, active: boolean): Promise<IdentityProvider[]> => {
  return tx.identity_provider.findMany({
    where: {
      active: active
    }
  });
};

/**
 * Parse the user token and update the user table if necessary
 * Create a contact entry if necessary
 * @param tx Prisma transaction client
 * @param token The decoded JWT token payload
 * @returns A Promise that resolves to the logged in user
 */
export const login = async (tx: PrismaTransactionClient, token: jwt.JwtPayload): Promise<User> => {
  const newUser = _tokenToUser(token);

  const oldUser = await tx.user.findFirst({
    where: {
      sub: newUser.sub
    }
  });

  const response = !oldUser ? await createUser(tx, newUser) : await updateUser(tx, oldUser.userId, newUser);

  // Create initial contact entry
  if (response) {
    const oldContact: Array<Contact> = await searchContacts(tx, {
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
      await upsertContacts(tx, [newContact]);
    }
  }

  return response;
};

/**
 * Gets an identity provider record
 * @param tx Prisma transaction client
 * @param code The identity provider code
 * @returns A Promise that resolves into the unique identity provider or null if not found
 */
const readIdp = async (tx: PrismaTransactionClient, code: string): Promise<IdentityProvider | null> => {
  const response = await tx.identity_provider.findUnique({
    where: {
      idp: code
    }
  });

  return response;
};

/**
 * Gets a user record
 * @param tx Prisma transaction client
 * @param userId The userId uuid
 * @returns A Promise that resolves into the unique user or null if not found
 */
export const readUser = async (tx: PrismaTransactionClient, userId: string): Promise<User | null> => {
  const response = await tx.user.findUnique({
    where: {
      userId
    }
  });

  return response;
};

/**
 * Search and filter for specific users
 * @param params.userId Optional array of uuids representing the user subject
 * @param params.idp Optional array of identity providers
 * @param params.sub Optional sub string to match on
 * @param params.email Optional email string to match on
 * @param params.firstName Optional firstName string to match on
 * @param params.fullName Optional fullName string to match on
 * @param params.lastName Optional lastName string to match on
 * @param params.active Optional boolean on user active status
 * @returns A Promise that resolves into a list of users from search params
 */
export const searchUsers = async (tx: PrismaTransactionClient, params: UserSearchParameters): Promise<User[]> => {
  const response = await tx.user.findMany({
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
 * Updates a user record only if there are changed values
 * @param tx Prisma transaction client
 * @param userId The userId uuid
 * @param data Incoming user data
 * @returns A Promise that resolves into the updated user
 */
const updateUser = async (tx: PrismaTransactionClient, userId: string, data: JwtUser): Promise<User> => {
  // Check if any user values have changed
  const oldUser = await readUser(tx, userId);
  const diff = Object.entries(data).some(([key, value]) => oldUser && oldUser[key as keyof JwtUser] !== value);

  if (diff) {
    const _updateUser = async (tx: PrismaTransactionClient, userId: string, data: JwtUser): Promise<User> => {
      // Patch existing user
      if (data.idp) {
        const identityProvider = await readIdp(tx, data.idp);
        if (!identityProvider) await createIdp(tx, data.idp);
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
      return await tx.user.update({
        data: obj,
        where: {
          userId
        }
      });
    };

    return await _updateUser(tx, userId, data);
  } else {
    // Nothing to update
    if (oldUser) return oldUser;
    else throw new Problem(404, { detail: 'User not found' });
  }
};
