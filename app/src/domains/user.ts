import { randomUUID } from 'node:crypto';

import { NotFoundProblem } from '#src/db/errors';
import { differential } from '#src/utils/index';

import type { Repositories } from '#src/db/unitOfWork';
import type { JwtUser } from '#src/services/login';
import type { User } from '#types';

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

  // Postgres aborts the whole transaction on a constraint violation, so a duplicate 'sub'
  // can't be caught-and-retried within the same transaction - upsert on the unique key instead.
  return await repositories.user.createIfNotExists({ sub: data.sub }, newUser);
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
