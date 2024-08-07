import * as core from 'express-serve-static-core';

import type { CurrentContext } from '../types/CurrentContext';

interface Query extends core.Query {}

interface Params extends core.ParamsDictionary {}

export interface Request<P extends Params = never, Q extends Query = never, B = never> extends core.Request {
  currentContext?: CurrentContext;
  params: P;
  query: Q;
  body: B;
}

export interface Response extends core.Response {}

export interface NextFunction extends core.NextFunction {}
