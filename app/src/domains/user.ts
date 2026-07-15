import { randomUUID } from 'node:crypto';

import { DuplicateKeyProblem, NotFoundProblem } from '../db/errors';
import { JwtUser } from '../services/login';
import { differential, Problem } from '../utils';

import type { Repositories } from '../db/unitOfWork';
import type { User } from '../types';

export const createUser = async (
  repositories: Pick<Repositories, 'identityProvider' | 'user'>,
  data: JwtUser
): Promise<User> => {
  if (data.idp) {
    await repositories.identityProvider.createIfNotExists({ idp: data.idp }, { idp: data.idp });
  }

  const newUser = {
    bceidBusinessName: data.bceidBusinessName ?? null,
    userId: randomUUID(),
    sub: data.sub,
    fullName: data.fullName,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    idp: data.idp,
    active: true
  };

  try {
    return await repositories.user.create(newUser);
  } catch (error) {
    if (error instanceof DuplicateKeyProblem && error.isConstraint('sub')) {
      const user = await repositories.user.findBySub(data.sub);
      if (!user)
        throw new Problem(500, {
          type: '/problems/invariant-violation',
          title: 'Invariant Violation',
          detail: 'User creation failed with a duplicate "sub", but no matching user could be found.'
        });
      return user;
    }

    throw error;
  }
};

export const updateUser = async (
  repositories: Pick<Repositories, 'identityProvider' | 'user'>,
  userId: string,
  data: JwtUser
): Promise<User> => {
  const oldUser = await repositories.user.findById(userId);
  if (!oldUser) throw new NotFoundProblem('User');

  const patch = differential(data, oldUser);

  if (Object.keys(patch).length === 0) {
    return oldUser;
  }

  if (data.idp) {
    await repositories.identityProvider.createIfNotExists({ idp: data.idp }, { idp: data.idp });
  }

  return await repositories.user.update({ userId }, patch);
};
