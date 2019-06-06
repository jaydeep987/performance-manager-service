import { UserController } from '~controller/users';
import { RouterBase } from '~lib/router-base';

/**
 * User related routes
 */
class UserRoutes extends RouterBase {

  /** Instance of controller to register with route */
  private userController: UserController;

  constructor() {
    super();
  }

  /**
   * Initialze controller
   */
  protected init(): void {
    this.userController = new UserController();
  }

  /**
   * Register routes for event
   */
  protected registerRoutes(): void {
    const userRoutes = this.router;
    const userController = this.userController;

    /** Default route to get all users, need token */
    userRoutes.get('/', userController.getAll);
    /** To create new user, no need token */
    userRoutes.post('/register', userController.create);
    /** Route with put method to update existing user */
    userRoutes.put('/', userController.update);
    /** Post route to authenticate user i.e. when login */
    userRoutes.post('/authenticate', userController.authenticate);
    /** To get user by user id */
    userRoutes.get('/:id', userController.getById);
    /** To delete user by id */
    userRoutes.delete('/', userController.deleteById);
    /** To invalidate token */
    userRoutes.post('/logout', userController.logout);
  }
}

export { UserRoutes };
