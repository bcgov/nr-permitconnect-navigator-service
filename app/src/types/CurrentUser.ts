import jwt from 'jsonwebtoken';

export type CurrentUser = {
  authType: string;
  tokenPayload: string | jwt.JwtPayload | null;
};
