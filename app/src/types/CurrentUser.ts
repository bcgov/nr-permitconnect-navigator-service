import jwt from 'jsonwebtoken';

import { ApiScope } from './ApiScope';
import { AuthType, Initiative } from '../utils/enums/application';

export type CurrentUser = {
  authType: AuthType;
  apiScope?: ApiScope;
  initiative?: Initiative;
  tokenPayload: string | jwt.JwtPayload | null;
};
