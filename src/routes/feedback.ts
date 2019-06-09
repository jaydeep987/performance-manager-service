import { FeedbackController } from '~controller/feedback';
import { RouterBase } from '~lib/router-base';

/**
 * Feedback related routes
 */
class FeedbackRoutes extends RouterBase {

  /** Instance of controller to register with route */
  private feedbackController: FeedbackController;

  constructor() {
    super();
  }

  /**
   * Initialze controller
   */
  protected init(): void {
    this.feedbackController = new FeedbackController();
  }

  /**
   * Register routes for feedback
   */
  protected registerRoutes(): void {
    const feedbackRoutes = this.router;
    const feedbackController = this.feedbackController;

    feedbackRoutes.get('/', feedbackController.getAll);
    feedbackRoutes.post('/create', feedbackController.create);
    feedbackRoutes.get('/:_id', feedbackController.getById);
    feedbackRoutes.put('/', feedbackController.update);
    feedbackRoutes.delete('/', feedbackController.deleteById);
  }
}

export { FeedbackRoutes };
