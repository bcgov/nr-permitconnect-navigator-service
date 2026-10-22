import compression from 'compression';
import config from 'config';
import cors from 'cors';
import { randomBytes } from 'crypto';
import express from 'express';
import helmet from 'helmet';
import { extname, join } from 'path';
import { rateLimit } from 'express-rate-limit';

import { requestSanitizer } from './src/middleware/requestSanitizer.ts';
import router from './src/routes/index.ts';
import { Problem } from './src/utils/index.ts';
import { DEFAULTCORS } from './src/utils/constants/application.ts';
import { getLogger, httpLogger } from './src/utils/log.ts';
import { readIdpList } from './src/utils/utils.ts';
import { state } from './state.ts';

import type { NextFunction, Request, Response } from 'express';

const log = getLogger(import.meta.filename);

const appRouter = express.Router();
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
// Static files are cheap to serve, and counting them would throttle a few hard refreshes
app.use(
  ['/api', '/config'],
  rateLimit({
    handler: (req: Request, res: Response): void => {
      new Problem(429, { detail: 'Too many requests, please try again later.' }).send(req, res);
    },
    legacyHeaders: true,
    limit: 250,
    /** @see https://datatracker.ietf.org/doc/html/draft-ietf-httpapi-ratelimit-headers-08 */
    standardHeaders: 'draft-8',
    windowMs: 60000 // 1 minute
  })
);
app.use(compression());
app.use(cors(DEFAULTCORS));
app.use(express.json({ limit: config.get('server.bodyLimit') }));
app.use(express.urlencoded({ extended: true }));
app.use(requestSanitizer);
app.set('query parser', 'extended');
app.use((_req, res, next) => {
  res.locals.cspNonce = randomBytes(32).toString('hex');
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': [
          "'self'",
          new URL(config.get('frontend.oidc.authority')).origin,
          new URL(config.get('frontend.coms.apiPath')).origin,
          new URL(config.get('frontend.geocoder.apiPath')).origin,
          new URL(config.get('frontend.orgbook.apiPath')).origin
        ],
        'img-src': ["'self'", 'data:', new URL(config.get('frontend.openStreetMap.apiPath')).origin], // eslint-disable-line
        'media-src': ["'self'", 'data:', (_req, res: any) => `'nonce-${res.locals.cspNonce}'`], // eslint-disable-line
        'script-src': ["'self'", (_req, res: any) => `'nonce-${res.locals.cspNonce}'`] // eslint-disable-line
      }
    }
  })
);

// Skip if running tests
if (process.env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Block requests until service is ready
app.use((req: Request, res: Response, next: NextFunction): void => {
  if (state.shutdown) {
    new Problem(503, { detail: 'Server is shutting down' }).send(req, res);
  } else if (!state.ready) {
    new Problem(503, { detail: 'Server is not ready' }).send(req, res);
  } else {
    next();
  }
});

// Disallow all scraping
app.get('/robots.txt', (_req: Request, res: Response): void => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Frontend configuration endpoint
appRouter.get('/config', (_req: Request, res: Response, next: NextFunction): void => {
  try {
    res.status(200).json({
      features: state.features,
      ...config.get('frontend'),
      gitRev: state.gitRev,
      idpList: readIdpList()
    });
  } catch (err) {
    next(err);
  }
});

// Base API Directory
appRouter.use('/api', router);

// Host the static frontend assets; hashed filenames change whenever content does, so browsers can keep them forever
appRouter.use('/assets', express.static(join(import.meta.dirname, './dist/assets'), { immutable: true, maxAge: '1y' }));
// index.html is left to the fallback below so it always gets no-cache
appRouter.use('/', express.static(join(import.meta.dirname, './dist'), { index: false }));

// SPA history fallback: client routes get index.html, while unknown API paths and missing files stay 404.
// index.html must always revalidate, as it points at the current build's hashed assets.
appRouter.get('/{*splat}', (req: Request, res: Response, next: NextFunction): void => {
  if (req.path.startsWith('/api') || extname(req.path)) return next();
  res.set('Cache-Control', 'no-cache');
  res.sendFile(join(import.meta.dirname, './dist/index.html'));
});

// Root level Router
app.use('/', appRouter);

// Handle 404
app.use((req: Request, res: Response): void => {
  new Problem(404).send(req, res);
});

/**
 * Handles errors that occur during the request-response lifecycle.
 * Logs the error stack if available and sends an appropriate response
 * to the client based on the type of error.
 * @param err - The error object that was thrown.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param _next - The next middleware function in the stack (unused).
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  if (err instanceof Problem) {
    log.error(err);
    err.send(req, res);
  } else {
    if (err.stack) log.error(err);
    new Problem(500, { detail: err.message ?? err.toString() }).send(req, res);
  }
}

// Handle 500
app.use(errorHandler);

export default app;
