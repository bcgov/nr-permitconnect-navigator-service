import { AsyncLocalStorage } from 'node:async_hooks';

import type jwt from 'jsonwebtoken';
import type { Group } from './api/resources.ts';
import type { AuthType, Initiative } from '../utils/enums/application.ts';

export const requestContext = new AsyncLocalStorage<{ principal: string }>();

export interface LocalContext {
  currentAuthorization: CurrentAuthorization;
  currentContext: CurrentContext;
}

export interface CurrentAuthorization {
  attributes: string[];
  groups: Group[];
}

export interface CurrentContext {
  authType: AuthType;
  bearerToken?: string;
  initiative: Initiative;
  tokenPayload?: jwt.JwtPayload;
  userId?: string;
}
