import jwt from 'jsonwebtoken';

import { ApiScope } from './ApiScope';
import { AuthType } from '../utils/enums/application';

export type CurrentUser = {
  authType: AuthType;
  apiScope: ApiScope;
  tokenPayload: string | jwt.JwtPayload | null;
};
