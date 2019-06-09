import { ReviewController } from '~controller/review';
import { RouterBase } from '~lib/router-base';

/**
 * Review related routes
 */
class ReviewRoutes extends RouterBase {

  /** Instance of controller to register with route */
  private reviewController: ReviewController;

  constructor() {
    super();
  }

  /**
   * Initialze controller
   */
  protected init(): void {
    this.reviewController = new ReviewController();
  }

  /**
   * Register routes for review
   */
  protected registerRoutes(): void {
    const reviewRoutes = this.router;
    const reviewController = this.reviewController;

    reviewRoutes.post('/', reviewController.getAll);
    reviewRoutes.post('/create', reviewController.create);
    reviewRoutes.get('/:_id', reviewController.getById);
    reviewRoutes.put('/', reviewController.update);
    reviewRoutes.delete('/', reviewController.deleteById);
  }
}

export { ReviewRoutes };
