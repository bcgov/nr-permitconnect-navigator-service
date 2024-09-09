import jwt from 'jsonwebtoken';

import { AuthType, Initiative } from '../utils/enums/application';

export type CurrentContext = {
  authType?: AuthType;
  bearerToken?: string;
  initiative?: Initiative;
  tokenPayload?: jwt.JwtPayload;
  userId?: string;
};
