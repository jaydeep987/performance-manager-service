import * as http from 'http';
import { EnvVars, config } from '~common/config';

import { app } from './app';
import { Logger } from './utils/logger';

const port = config.get(EnvVars.PORT);
const host = config.get(EnvVars.HOST);
app.set('host', host);
app.set('port', port);

const server = http.createServer(app);
server.listen(port, host);
server.on('error', onError);
server.on('listening', onListening);

/**
 * On server error
 */
function onError(error: NodeJS.ErrnoException): void {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;
  switch (error.code) {
    case 'EACCES':
      Logger.error({message: `${bind} requires elevated privilages`, prefix: 'Server'});
      process.exit(1);
      break;
    case 'EADDRINUSE':
      Logger.error({message: `${bind} is already in use`, prefix: 'Server'});
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * When server is listening
 */
function onListening(): void {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `Pipe ${addr}` : `Address: ${addr.address} Port ${addr.port}`;
  Logger.info({message: `Listening on ${bind}`, prefix: 'Server'});
}
