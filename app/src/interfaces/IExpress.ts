import type { CurrentAuthorization } from '../types/CurrentAuthorization.ts';
import type { CurrentContext } from '../types/CurrentContext.ts';

declare module 'express-serve-static-core' {
  export interface Request {
    currentAuthorization: CurrentAuthorization;
    currentContext: CurrentContext;
  }
}
