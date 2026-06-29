import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { createUser, updateUser } from '../domains/user.ts';
import { unitOfWork } from '../repository/unitOfWork.ts';
import { IdentityProviderKind } from '../utils/enums/application.ts';

import type { Contact, User } from '../types/models.ts';

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
 * Parse the user token and update the user table if necessary
 * Create a contact entry if necessary
 * @param token - The decoded JWT token payload
 * @returns A Promise that resolves to the logged in user
 */
export const loginService = async (token: jwt.JwtPayload): Promise<User> => {
  return await unitOfWork.execute(async ({ contact, identityProvider, user }) => {
    const newUser = _tokenToUser(token);

    const oldUser = await user.findFirst({
      where: {
        sub: newUser.sub
      }
    });

    const response = oldUser
      ? await updateUser({ identityProvider, user }, oldUser.userId, newUser)
      : await createUser({ identityProvider, user }, newUser);

    // Create initial contact entry
    if (response) {
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
    }

    return response;
  });
};
