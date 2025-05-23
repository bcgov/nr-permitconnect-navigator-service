#!/usr/bin/env node

/** Module dependencies */
import config from 'config';
import http from 'http';

import app from '../app';
import getLogger from '../src/components/log';
import { refreshCodeCaches } from '../src/utils/cache/codes';

const log = getLogger(module.filename);

(async () => {
  await refreshCodeCaches();
})();

/** Normalize a port into a number, string, or false. */
const normalizePort = (val: string) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

/** Event listener for HTTP server "error" event. */
const onError = (error: { syscall: string; code: string }) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

/** Event listener for HTTP server "listening" event. */
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr?.port;
  log.info('Listening on ' + bind);
};

/** Get port from environment and store in Express. */
const port = normalizePort(config.get('server.port'));
app.set('port', port);

/** Create HTTP server. */
const server = http.createServer(app);

/** Listen on provided port, on all network interfaces. */
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
