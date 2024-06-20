import type { NextFunction, Request, Response } from '../interfaces/IExpress';

export type Middleware = (req: Request, _res: Response, next: NextFunction) => void;
