import { Request, Response } from 'express';
import * as Joi from 'joi';
import { ErrorTypes, ResponseStatus } from '~common/constants';
import { ControllerBase } from '~lib/controller-base';
import { FeedbackModel, feedbackValidationSchema } from '~model/feedback';
import { Logger } from '~utils/logger';

/**
 * Controller for handling feedback related routes
 * 
 * TODO: Before create/update/delete feedback, check review exists or not in db.
 */
class FeedbackController extends ControllerBase {

  /** Controller name to use in logs */
  private readonly controllerName = 'FeedbackController';

  /**
   * Creates new feedback for some employee in database
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { value, error } = Joi.validate(req.body, feedbackValidationSchema);

      if (error && error.details) {
        Logger.error({
          message: 'Validation error',
          prefix: `${this.controllerName}:create`,
          extraInfo: error.details,
        });

        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse(error, ErrorTypes.VALIDATION_ERROR));
      }

      const currentTime = new Date();
      const userId = req.cookies.token.userId;
      const data = {
        ...value,
        createdBy: userId,
        createdDate: currentTime,
        updatedBy: userId,
        updatedDate: currentTime,
      };
      const feedback = await FeedbackModel.create(data);

      return res
        .status(ResponseStatus.OK_CREATED)
        .json(feedback);

    } catch (error) {
      Logger.error({
        message: 'Error while saving record',
        prefix: `${this.controllerName}:create`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }

  /**
   * Get all feedbacks of some employee which is created by someone along with feedbacks
   * For that we need updatedBy and employeeId in request body.
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    const { reviewId } = req.body;

    if (!reviewId) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing review id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const users =
        await FeedbackModel
          .find({ reviewId })
          .exec();

      if (!users) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Record not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(users);

    } catch (error) {
      Logger.error({
        message: 'Error while retrieving',
        prefix: `${this.controllerName}:getAll`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }

  /**
   * Get feedback by id
   */
  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.params._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const user =
        await FeedbackModel
          .findById(req.params._id)
          .exec();

      if (!user) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Feedback not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(user);

    } catch (error) {
      Logger.error({
        message: 'Error while retrieving',
        prefix: `${this.controllerName}:getById`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }

  /**
   * Updates feedback, finding by id
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const feedback = await FeedbackModel
        .findById(req.body._id)
        .exec();

      if (!feedback) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse('Feedback Not Found', ErrorTypes.PARAM_ERROR));
      }

      const { _id, ...withoutId } = req.body;

      Object
        .keys(withoutId)
        .forEach((path) => {
          feedback.set(path, req.body[path]);
        });

      await feedback.save();

      return res
        .status(ResponseStatus.OK)
        .json(feedback);
    } catch (error) {
      Logger.error({
        message: 'Error while updating',
        prefix: `${this.controllerName}:update`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }

  /**
   * Delete single feedback by id
   */
  deleteById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const deletedFeedback =
        await FeedbackModel
          .deleteOne({_id: req.body._id})
          .exec();

      if (!deletedFeedback) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Feedback not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(deletedFeedback);
    } catch (error) {
      Logger.error({
        message: 'Error while deleting',
        prefix: `${this.controllerName}:deleteById`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }
}

export { FeedbackController };
