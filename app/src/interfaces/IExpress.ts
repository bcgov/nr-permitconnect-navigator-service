import type { CurrentAuthorization, CurrentContext } from '../types/index.ts';

declare module 'express-serve-static-core' {
  export interface Request {
    currentAuthorization: CurrentAuthorization;
    currentContext: CurrentContext;
  }
}
