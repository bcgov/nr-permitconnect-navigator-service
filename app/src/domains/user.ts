import { v4 as uuidv4 } from 'uuid';

import { Repositories } from '../repository/unitOfWork';
import { JwtUser } from '../services/login';
import { Problem } from '../utils';

import type { User } from '../types';

export const createUser = async (
  repositories: Pick<Repositories, 'identityProvider' | 'user'>,
  data: JwtUser
): Promise<User> => {
  const exists = await repositories.user.findFirst({
    where: {
      sub: data.sub
    }
  });

  if (exists) return exists;

  if (data.idp) {
    const idp = await repositories.identityProvider.findFirst({
      where: {
        idp: data.idp
      }
    });

    if (!idp) await repositories.identityProvider.create({ idp: data.idp });
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
    active: true
  };

  return await repositories.user.create(newUser);
};

export const updateUser = async (
  repositories: Pick<Repositories, 'identityProvider' | 'user'>,
  userId: string,
  data: JwtUser
): Promise<User> => {
  // Check if any user values have changed
  const oldUser = await repositories.user.findUnique({
    where: {
      userId
    }
  });
  const diff = Object.entries(data).some(([key, value]) => oldUser && oldUser[key as keyof JwtUser] !== value);

  if (diff) {
    if (data.idp) {
      const idp = await repositories.identityProvider.findFirst({
        where: {
          idp: data.idp
        }
      });

      if (!idp) await repositories.identityProvider.create({ idp: data.idp });
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

    return await repositories.user.update({ userId }, obj);
  } else if (oldUser) {
    // Nothing to update
    return oldUser;
  } else throw new Problem(404, { detail: 'User not found' });
};
