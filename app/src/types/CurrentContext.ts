import jwt from 'jsonwebtoken';

import { AuthType, Initiative } from '../utils/enums/application';

export type CurrentContext = {
  authType: AuthType;
  initiative?: Initiative;
  tokenPayload: string | jwt.JwtPayload | null;
  userId: string | null;
};
