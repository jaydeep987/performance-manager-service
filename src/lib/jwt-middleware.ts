import { RequestHandler } from 'express';
import * as expressJwt from 'express-jwt';

export const JWT_SECRET = 'uFrr21fmu9z1dEykoz00cyId9vpVumHwDBDxQBqjmfwmBmi3TwFnM2YdV1cf2Qu';

/**
 * Build JWT middleware to protect routes
 */
export function jwt(): RequestHandler {

  return expressJwt({
    secret: JWT_SECRET,
    getToken: ((req) => {
      const token = req.cookies && req.cookies.token && req.cookies.token.token;

      return token;
    }),
  })
  .unless({
    path: [
      '/users/authenticate',
      '/users/register',
      '/users/logout',
    ],
  });
}
