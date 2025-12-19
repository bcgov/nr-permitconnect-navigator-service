import { Prisma } from '@prisma/client';
import compression from 'compression';
import config from 'config';
import cors from 'cors';
import { randomBytes } from 'crypto';
import express from 'express';
import helmet from 'helmet';
import { join } from 'path';
import querystring from 'querystring';

import { requestSanitizer } from './src/middleware/requestSanitizer.ts';
import router from './src/routes/index.ts';
import { Problem } from './src/utils/index.ts';
import { DEFAULTCORS } from './src/utils/constants/application.ts';
import { getLogger, httpLogger } from './src/utils/log.ts';
import { readIdpList } from './src/utils/utils.ts';
import { state } from './state.ts';

import type { NextFunction, Request, Response } from 'express';

const log = getLogger(module.filename);

const appRouter = express.Router();
const app = express();
app.disable('x-powered-by');
app.use(compression());
app.use(cors(DEFAULTCORS));
app.use(express.json({ limit: config.get('server.bodyLimit') }));
app.use(express.urlencoded({ extended: true }));
app.use(requestSanitizer);
app.set('query parser', 'extended');

app.use((_req, res, next) => {
  res.locals.cspNonce = randomBytes(32).toString('hex');
  helmet({
    contentSecurityPolicy: {
      directives: {
        'default-src': [
          "'self'", // eslint-disable-line
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
  });
  next();
});

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

// Host the static frontend assets
// This route assumes being executed from '/sbin'
appRouter.use('/', express.static(join(__dirname, '../dist')));

// Root level Router
app.use('/', appRouter);

// Handle 404
app.use((req: Request, res: Response): void => {
  if (req.originalUrl.startsWith('/api')) {
    new Problem(404).send(req, res);
  } else {
    // Redirect any non-API requests to static frontend with redirect breadcrumb
    const query = querystring.stringify({ ...req.query, r: req.path });
    res.redirect(`/?${query}`);
  }
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
    err.send(req, res);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2003':
        new Problem(500, {
          type: err.code,
          title: err.meta?.constraint as string,
          detail: err.meta?.modelName as string
        }).send(req, res);
        break;
      case 'P2025':
        new Problem(404, {
          type: err.code,
          title: err.meta?.cause as string,
          detail: err.meta?.modelName as string
        }).send(req, res);
        break;
      default:
        new Problem(500, {
          type: err.code,
          title: err.meta?.cause as string,
          detail: err.meta?.modelName as string
        }).send(req, res);
        break;
    }
  } else {
    if (err.stack) log.error(err);
    new Problem(500, { detail: err.message ?? err.toString() }).send(req, res);
  }
}

// Handle 500
app.use(errorHandler);

export default app;
