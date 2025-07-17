import { CurrentAuthorization, CurrentContext } from '../types';

declare module 'express-serve-static-core' {
  export interface Request {
    currentAuthorization: CurrentAuthorization;
    currentContext: CurrentContext;
  }
}
