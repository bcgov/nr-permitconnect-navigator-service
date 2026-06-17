import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { unitOfWork } from '../repository/uow.ts';
import { SYSTEM_ID } from '../utils/constants/application.ts';
import { IdentityProviderKind } from '../utils/enums/application.ts';
import { isTruthy, Problem } from '../utils/index.ts';

import type { Contact, User } from '../types/models.ts';
import type { Group, UserSearchParameters } from '../types/stuff.ts';
import { createUser } from './helpers/user.ts';

export type UserWithGroup = User & { groups?: Group[] };

/**
 * An equivalent User model object without timestamp information
 */
export interface JwtUser {
  active: boolean;
  bceidBusinessName: string | null;
  email: string | null;
  firstName: string | null;
  fullName: string | null;
  idp: string | null;
  lastName: string | null;
  sub: string;
}

/**
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
 * Create a user DB record
 * @param data Incoming user data
 * @returns A Promise that resolves to the created user
 */
export const createUserService = async (data: JwtUser): Promise<User> => {
  return await unitOfWork.execute(async ({ identityProvider, user }) => {
    return await createUser({ identityProvider, user }, data);
  });
};

/**
 * Parse the user token and update the user table if necessary
 * Create a contact entry if necessary
 * @param token The decoded JWT token payload
 * @returns A Promise that resolves to the logged in user
 */
export const login = async (token: jwt.JwtPayload): Promise<User> => {
  const newUser = _tokenToUser(token);

  const oldUser = await unitOfWork.execute(async ({ user }) => {
    return await user.findFirst({
      where: {
        sub: newUser.sub
      }
    });
  });

  const response = oldUser ? await updateUserService(oldUser.userId, newUser) : await createUserService(newUser);

  // Create initial contact entry
  if (response) {
    await unitOfWork.execute(async ({ contact }) => {
      const oldContact: Contact[] = await contact.findMany({
        where: {
          userId: { in: [response.userId] }
        }
      });

      if (!oldContact.length) {
        // BCeID crams the entire name into firstName
        // Parse first word into first name and rest into last name
        // This does not guarantee name correctness, but a null last name breaks ATS
        let firstNameOverride: string | null = null,
          lastNameOverride: string | null = null;
        if (
          [IdentityProviderKind.BCEID, IdentityProviderKind.BCEIDBUSINESS].includes(newUser.idp as IdentityProviderKind)
        ) {
          const split = newUser.firstName?.indexOf(' ');
          if (newUser.firstName && split && split > 0) {
            firstNameOverride = newUser.firstName.substring(0, split);
            lastNameOverride = newUser.firstName.substring(split + 1);
          } else {
            firstNameOverride = newUser.firstName;
          }
        }

        const newContact = {
          contactId: uuidv4(),
          userId: response.userId,
          firstName: firstNameOverride ?? newUser.firstName,
          lastName: lastNameOverride ?? newUser.lastName ?? ' ', // Default blank string if no other options
          email: newUser.email,
          phoneNumber: null,
          contactApplicantRelationship: null,
          contactPreference: null
        };
        await contact.upsert({ contactId: newContact.contactId }, newContact, newContact);
      }
    });
  }

  return response;
};

/**
 * Gets a user record
 * @param userId The userId uuid
 * @returns A Promise that resolves into the unique user or null if not found
 */
export const getUserService = async (userId: string): Promise<User | null> => {
  return await unitOfWork.execute(async ({ user }) => {
    return await user.findUnique({
      userId
    });
  });
};

/**
 * Search and filter for specific users
 * @param params Optional filtering parameters
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
export const searchUsersService = async (params: UserSearchParameters): Promise<User[]> => {
  const users = await unitOfWork.execute(async ({ initiative, subjectGroup, user }) => {
    const users = await user.findMany({
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
        ],
        NOT: [
          {
            userId: SYSTEM_ID
          }
        ]
      }
    });

    // Inject found users with their groups if necessary
    let userWithGroups: UserWithGroup[] = users;

    if (params.group?.length || isTruthy(params.includeUserGroups)) {
      for (const user of userWithGroups) {
        user.groups = await subjectGroup.getSubjectGroups(user.sub);
      }

      // Filters users based on groups
      if (params.group?.length) {
        userWithGroups = userWithGroups.filter((user) =>
          params.group?.some((g) => user.groups?.some((ug) => ug.name === g))
        );
      }

      // Filters user groups based on initiative
      if (params.initiative?.length) {
        const initiativeResult = (
          await Promise.all(
            params.initiative.map((i) =>
              initiative.findFirstOrThrow({
                where: {
                  code: i
                }
              })
            )
          )
        ).flatMap((r) => r);
        userWithGroups.forEach((user) => {
          if (user.groups)
            user.groups = user.groups.filter((ug) => initiativeResult.some((i) => ug.initiativeId === i.initiativeId));
        });
      }

      // Remove groups if not requested
      if (!isTruthy(params.includeUserGroups)) {
        for (const user of userWithGroups) {
          delete user.groups;
        }
      }
    }

    return userWithGroups;
  });

  return users;
};

/**
 * Updates a user record only if there are changed values
 * @param userId The userId uuid
 * @param data Incoming user data
 * @returns A Promise that resolves into the updated user
 */
export const updateUserService = async (userId: string, data: JwtUser): Promise<User> => {
  return await unitOfWork.execute(async ({ identityProvider, user }) => {
    // Check if any user values have changed
    const oldUser = await user.findUnique({
      userId
    });
    const diff = Object.entries(data).some(([key, value]) => oldUser && oldUser[key as keyof JwtUser] !== value);

    if (diff) {
      if (data.idp) {
        const idp = await identityProvider.findFirst({
          where: {
            idp: data.idp
          }
        });

        if (!idp) await identityProvider.create({ idp: data.idp });
      }

      // Patch existing user
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

      return await user.update({ userId }, obj);
    } else if (oldUser) {
      // Nothing to update
      return oldUser;
    } else throw new Problem(404, { detail: 'User not found' });
  });
};
