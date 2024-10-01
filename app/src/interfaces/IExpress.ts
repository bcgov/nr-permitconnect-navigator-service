import type { CurrentAuthorization } from '../types/CurrentAuthorization';
import type { CurrentContext } from '../types/CurrentContext';

declare module 'express-serve-static-core' {
  export interface Request {
    currentAuthorization: CurrentAuthorization;
    currentContext: CurrentContext;
  }
}
