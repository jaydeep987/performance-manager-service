import * as express from 'express';

import { UserRoutes } from './users';

const routes = express.Router();

routes.use('/users', new UserRoutes().getRouter());

export { routes };
