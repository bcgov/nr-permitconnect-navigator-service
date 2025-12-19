#!/usr/bin/env node

/** Module dependencies */
import config from 'config';
import { createServer } from 'node:http';

import app from './app.ts';
import { checkDatabaseHealth, checkDatabaseSchema } from './src/db/utils/utils.ts';
import { refreshCodeCaches } from './src/utils/cache/codes.ts';
import getLogger from './src/utils/log.ts';
import { state } from './state.ts';

const log = getLogger(module.filename);
const port = normalizePort(config.get('server.port') ?? '3000');

// Prevent unhandled rejections from crashing application
process.on('unhandledRejection', (err: Error): void => {
  if (err?.stack) log.error(err);
});

// Graceful shutdown support
['SIGHUP', 'SIGINT', 'SIGTERM', 'SIGUSR1', 'SIGUSR2'].forEach((signal) => {
  process.on(signal, () => shutdown(signal as NodeJS.Signals));
});
process.on('exit', () => log.info('Exiting...'));

// Create HTTP server and listen on provided port, on all network interfaces.
const server = createServer(app);
server.listen(port, () => {
  log.info(`Server running on http://localhost:${port}`);
});
server.on('error', onError);

// Start periodic 10 second connection probes
const probeId = setInterval(() => {
  void checkDatabaseHealth().then((result) => {
    if (!state.ready && result) log.info('Database has recovered');
    state.ready = result;
  });
}, 10000);

// Perform preliminary database checks
void startup();

/**
 * Normalize a port into a number, string, or false.
 * @param val Port string value
 * @returns A number, string or false
 */
function normalizePort(val: string): string | number | boolean {
  const port = parseInt(val, 10);

  if (isNaN(port)) return val; // named pipe
  if (port >= 0) return port; // port number

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 * @param error Error event
 * @param error.syscall System call
 * @param error.code Error code
 */
function onError(error: { syscall?: string; code: string }): void {
  // eslint-disable-next-line @typescript-eslint/only-throw-error
  if (error.syscall !== 'listen') throw error;

  // Handle specific listen errors with friendly messages
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      log.error(`${bind} requires elevated privileges`);
      shutdown('SIGABRT');
      break;
    case 'EADDRINUSE':
      log.error(`${bind} is already in use`);
      shutdown('SIGABRT');
      break;
    default:
      throw error; // eslint-disable-line @typescript-eslint/only-throw-error
  }
}

/**
 * Gracefully shuts down the server and exits the process.
 * @see https://nodejs.org/api/http.html#servercloseallconnections
 * @param signal - Optional termination signal (e.g., 'SIGINT', 'SIGTERM').
 */
function cleanup(signal?: NodeJS.Signals): void {
  state.ready = false;
  server.close(() => {
    log.debug('Closing all server connections...');
    server.closeAllConnections();
    log.info('Server shut down');
    if (signal) process.kill(process.pid, signal);
    else process.exit();
  });
}

/**
 * Handles application shutdown on termination signals.
 * @param signal - Received termination signal (e.g., 'SIGINT', 'SIGTERM').
 */
function shutdown(signal: NodeJS.Signals): void {
  state.shutdown = true;
  log.info(`Received ${signal} signal. Shutting down...`);

  // Stop periodic 10 second connection probes
  if (probeId) clearInterval(probeId);
  cleanup(signal);
}

/**
 * Initializes the server by performing database health and schema checks.
 */
async function startup(): Promise<void> {
  try {
    if (!(await checkDatabaseHealth())) throw new Error('Health check failed');
    if (!(await checkDatabaseSchema())) throw new Error('Schema check failed');
    if (!(await refreshCodeCaches())) throw new Error('Code cache refresh failed');
    state.ready = true;
  } catch (error) {
    log.error('Error during startup checks:', error);
    shutdown('SIGTERM');
  }
}
