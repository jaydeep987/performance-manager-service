import { Request, Response } from 'express';
import * as Joi from 'joi';
import { ErrorTypes, ResponseStatus } from '~common/constants';
import { ControllerBase } from '~lib/controller-base';
import { FeedbackModel } from '~model/feedback';
import { ReviewModel, reviewValidationSchema } from '~model/review';
import { Logger } from '~utils/logger';

/**
 * Controller for handling review related routes
 */
class ReviewController extends ControllerBase {

  /** Controller name to use in logs */
  private readonly controllerName = 'ReviewController';

  /**
   * Creates new review for some employee in database
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { value, error } = Joi.validate(req.body, reviewValidationSchema);

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
      const review = await ReviewModel.create(data);

      return res
        .status(ResponseStatus.OK_CREATED)
        .json(review);

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
   * Get all reviews of some employee along with feedbacks
   * For that we need employeeId in request body.
   * Optionally if updatedById presents, then filter by that. That's for
   * filtering reviews for person who wrote it.
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    const { updatedBy, employeeId } = req.body;

    if (!employeeId) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing employee id  parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const matchQuery = {
        employeeId,
        ...updatedBy && { updatedBy },
      };

      const users =
        await ReviewModel
          .aggregate([
            {
              $match: matchQuery,
            },
            {
              $addFields: {
                rid: {
                  $toString: '$_id',
                },
              },
            },
            {
              $lookup: {
                from: 'feedbacks',
                localField: 'rid',
                foreignField: 'reviewId',
                as: 'feedbacks',
              },
            },
            {
              $addFields: {
                updatedBy: {
                  $toObjectId: '$updatedBy',
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'updatedBy',
                foreignField: '_id',
                as: 'userInfo',
              },
            },
            {
              $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ '$userInfo', 0 ] }, '$$ROOT' ] } },
            },
            {
              $project: {
                _id: 1,
                createdBy: 1,
                createdDate: 1,
                description: 1,
                employeeId: 1,
                feedbacks: 1,
                rid: 1,
                updatedBy: 1,
                updatedDate: 1,
                reviewBy: { $concat: [ '$firstName', ' ' , '$lastName' ] },
              },
            },
          ])
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
   * Get review by id
   */
  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.params._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const user =
        await ReviewModel
          .findById(req.params._id)
          .exec();

      if (!user) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Review not found', ErrorTypes.FETCH_ERROR));
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
   * Updates review, finding by id
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const review = await ReviewModel
        .findById(req.body._id)
        .exec();

      if (!review) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse('Review Not Found', ErrorTypes.PARAM_ERROR));
      }

      const { _id, ...withoutId } = req.body;

      Object
        .keys(withoutId)
        .forEach((path) => {
          review.set(path, req.body[path]);
        });

      await review.save();

      return res
        .status(ResponseStatus.OK)
        .json(review);
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
   * Delete single review by id
   */
  deleteById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const deletedReview =
        await ReviewModel
          .deleteOne({_id: req.body._id})
          .exec();

      if (!deletedReview) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Review not found', ErrorTypes.FETCH_ERROR));
      }

      // Also delete all feedbacks for this review.
      // NOTE that it's better to use transaction here.
      await FeedbackModel
        .deleteMany({
          reviewId: req.body._id,
        })
        .exec();

      return res
        .status(ResponseStatus.OK)
        .json(deletedReview);
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

export { ReviewController };
