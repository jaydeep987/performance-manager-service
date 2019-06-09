import { AssigneeController } from '~controller/assignee';
import { RouterBase } from '~lib/router-base';

/**
 * Assignee related routes
 */
class AssigneeRoutes extends RouterBase {

  /** Instance of controller to register with route */
  private assigneeController: AssigneeController;

  constructor() {
    super();
  }

  /**
   * Initialze controller
   */
  protected init(): void {
    this.assigneeController = new AssigneeController();
  }

  /**
   * Register routes for assignee
   */
  protected registerRoutes(): void {
    const assigneeRoutes = this.router;
    const assigneeController = this.assigneeController;

    assigneeRoutes.post('/', assigneeController.getAll);
    assigneeRoutes.post('/create', assigneeController.create);
    assigneeRoutes.get('/:_id', assigneeController.getById);
    assigneeRoutes.delete('/', assigneeController.deleteById);
  }
}

export { AssigneeRoutes };
