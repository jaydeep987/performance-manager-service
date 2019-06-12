import * as bodyParser from 'body-parser';
import * as compress from 'compression';
import * as cookieParser from 'cookie-parser';
import * as cors from 'cors';
import * as express from 'express';
import * as helmet from 'helmet';
import { ResponseStatus } from '~common/constants';
import { errorHandler } from '~lib/error-handler';
import { jwt } from '~lib/jwt-middleware';

import { EnvVars, config } from './common/config';
import { mongoConnect } from './lib/mongo-connect';
import { routes } from './routes';

/**
 * App starter
 */
class App {
  /** Express instance to start with */
  private express: express.Application;

  /**
   * Creates and initializes app
   */
  async createApp(): Promise<express.Application> {
    this.express = express();
    await this.middleware();
    this.routes();
    this.configureErrorHandler();

    return this.express;
  }

  /**
   * Configures middlewares
   */
  private async middleware(): Promise<void> {
    await mongoConnect();

    const corsOptions: cors.CorsOptions = {
      origin: config.get(EnvVars.ORIGIN_ALLOWED),
      optionsSuccessStatus: ResponseStatus.OK, // some legacy browsers (IE11, various SmartTVs) choke on 204
      credentials: true,
    };

    this.express.use(cors(corsOptions));
    // Enable pre-flight across-the-board, so complex requests like put/delete works fine
    this.express.options('*', cors(corsOptions));
    this.express.use(compress());
    this.express.use(cookieParser());
    // set JWT middleware
    this.express.use(jwt());
    // secures our app by providing some headers like cross domain, noCache etc
    this.express.use(helmet());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  /**
   * Configures routes
   */
  private routes(): void {
    this.express.use('/', routes);
  }

  /**
   * Configures error handler
   */
  private configureErrorHandler(): void {
    this.express.use(errorHandler);
  }
}

export { App };
