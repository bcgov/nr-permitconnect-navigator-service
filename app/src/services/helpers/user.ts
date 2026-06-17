import { v4 as uuidv4 } from 'uuid';

import { Repositories } from '../../repository/uow';
import { JwtUser } from '../user';

export const createUser = async (repositories: Pick<Repositories, 'identityProvider' | 'user'>, data: JwtUser) => {
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
