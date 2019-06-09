import * as express from 'express';

import { AssigneeRoutes } from './assignee';
import { FeedbackRoutes } from './feedback';
import { ReviewRoutes } from './reviews';
import { UserRoutes } from './users';

const routes = express.Router();

routes.use('/users', new UserRoutes().getRouter());
routes.use('/reviews', new ReviewRoutes().getRouter());
routes.use('/feedbacks', new FeedbackRoutes().getRouter());
routes.use('/assignees', new AssigneeRoutes().getRouter());

export { routes };
