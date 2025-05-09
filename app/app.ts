import compression from 'compression';
import config from 'config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { join } from 'path';
// @ts-expect-error api-problem lacks a defined interface; code still works fine
import Problem from 'api-problem';
import querystring from 'querystring';
import { randomBytes } from 'crypto';

import { name as appName, version as appVersion } from './package.json';
import { getLogger, httpLogger } from './src/components/log';
import { DEFAULTCORS } from './src/utils/constants/application';
import { getGitRevision, readIdpList } from './src/utils/utils';
import v1Router from './src/routes/v1';

import type { Request, Response } from 'express';

const log = getLogger(module.filename);

const state = {
  gitRev: getGitRevision(),
  ready: true, // No dependencies so application is always ready
  shutdown: false
};

const appRouter = express.Router();
const app = express();
app.use(compression());
app.use(cors(DEFAULTCORS));
app.use(express.json({ limit: config.get('server.bodyLimit') }));
app.use(express.urlencoded({ extended: true }));
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
  })
);

// Skip if running tests
if (process.env.NODE_ENV !== 'test') {
  app.use(httpLogger);
}

// Block requests until service is ready
app.use((_req: Request, res: Response, next: () => void): void => {
  if (state.shutdown) {
    new Problem(503, { details: 'Server is shutting down' }).send(res);
  } else if (!state.ready) {
    new Problem(503, { details: 'Server is not ready' }).send(res);
  } else {
    next();
  }
});

// Disallow all scraping
app.get('/robots.txt', (_req: Request, res: Response): void => {
  res.type('text/plain');
  res.send('User-agent: *\nDisallow: /');
});

// Base API Directory
appRouter.get('/api', (_req: Request, res: Response): void => {
  if (state.shutdown) {
    throw new Error('Server shutting down');
  } else {
    res.status(200).json({
      app: {
        gitRev: state.gitRev,
        name: appName,
        nodeVersion: process.version,
        version: appVersion
      },
      endpoints: ['/api/v1'],
      versions: [1]
    });
  }
});

// Frontend configuration endpoint
appRouter.get('/config', (_req: Request, res: Response, next: (err: unknown) => void): void => {
  try {
    res.status(200).json({
      ...config.get('frontend'),
      gitRev: state.gitRev,
      idpList: readIdpList(),
      version: appVersion
    });
  } catch (err) {
    next(err);
  }
});

// v1 Router
appRouter.use(config.get('server.apiPath'), v1Router);

// Host the static frontend assets
// This route assumes being executed from '/sbin'
appRouter.use('/', express.static(join(__dirname, '../dist')));

// Root level Router
app.use('/', appRouter);

// Handle 500
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
app.use((err: Problem, _req: Request, res: Response, _next: () => void): void => {
  if (err.stack) {
    log.error(err);
  }

  if (err instanceof Problem) {
    err.send(res, undefined);
  } else {
    new Problem(500, 'Server Error', {
      detail: err.message ? err.message : err
    }).send(res);
  }
});

// Handle 404
app.use((req: Request, res: Response): void => {
  if (req.originalUrl.startsWith('/api')) {
    // Return a 404 problem if attempting to access API
    new Problem(404, 'Page Not Found', {
      detail: req.originalUrl
    }).send(res);
  } else {
    // Redirect any non-API requests to static frontend with redirect breadcrumb
    const query = querystring.stringify({ ...req.query, r: req.path });
    res.redirect(`/?${query}`);
  }
});

// Prevent unhandled errors from crashing application
process.on('unhandledRejection', (err: Error): void => {
  if (err && err.stack) {
    log.error(err);
  }
});

// Graceful shutdown support
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGUSR1', shutdown);
process.on('SIGUSR2', shutdown);
process.on('exit', () => {
  log.info('Exiting...');
});

/**
 * @function shutdown
 * Shuts down this application after at least 3 seconds.
 */
function shutdown(): void {
  log.info('Received kill signal. Shutting down...');
  // Wait 3 seconds before starting cleanup
  if (!state.shutdown) setTimeout(cleanup, 3000);
}

/**
 * @function cleanup
 * Cleans up connections in this application.
 */
function cleanup(): void {
  log.info('Service no longer accepting traffic');
  state.shutdown = true;
  process.exit();
}

export default app;
