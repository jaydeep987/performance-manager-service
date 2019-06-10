import { Request, Response } from 'express';
import * as Joi from 'joi';
import { ErrorTypes, ResponseStatus } from '~common/constants';
import { ControllerBase } from '~lib/controller-base';
import { AssigneeModel, assigneeValidationSchema } from '~model/assignee';
import { UserModel } from '~model/user';
import { Logger } from '~utils/logger';

/**
 * Controller for handling assignee related routes
 */
class AssigneeController extends ControllerBase {

  /** Controller name to use in logs */
  private readonly controllerName = 'AssigneeController';

  /**
   * Creates new assignee for some employee in database
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { value, error } = Joi.validate(req.body, assigneeValidationSchema);

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

      const { assigneeId, assignedEmployeeId } = req.body;

      // First check assignee must not himself assigned employee
      if (assignedEmployeeId === assigneeId) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse('Assignee cannot assign to himself', ErrorTypes.VALIDATION_ERROR));
      }

      // Then we need to check if coming assignee is already assigned to employee or not
      const foundAssignee = await AssigneeModel
        .findOne({
          assigneeId,
          assignedEmployeeId,
        })
        .exec();

      if (foundAssignee) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse('That assignee is already assigned', ErrorTypes.VALIDATION_ERROR));
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
      const assignee = await AssigneeModel.create(data);
      // Get user info for added assignee
      const assigneeInfo = await UserModel
        .findById(assignee.get('assigneeId'))
        .exec();

      return res
        .status(ResponseStatus.OK_CREATED)
        .json({
          ...assignee.toObject(),
          assigneeInfo: [assigneeInfo],
        });

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
   * Get all assignees of some employee which is created by someone along with assignees
   * For that we need updatedBy and employeeId in request body.
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    const { assignedEmployeeId } = req.body;

    if (!assignedEmployeeId) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing assignedEmployee id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const assignees =
        await AssigneeModel
          .aggregate([
            {
              $match: {
                assignedEmployeeId,
              },
            },
            {
              $addFields: {
                assigneeId: {
                  $toObjectId: '$assigneeId',
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'assigneeId',
                foreignField: '_id',
                as: 'assigneeInfo',
              },
            },
          ])
          .exec();

      if (!assignees) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Record not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(assignees);

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
   * Get employees who are assigned to given assignee.
   */
  getAssignedEmployees = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body.assigneeId) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Assignee Id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const { assigneeId } = req.body;

      const assignees =
        await AssigneeModel
          .aggregate([
            {
              $match: {
                assigneeId,
              },
            },
            {
              $addFields: {
                assignedEmployeeId: {
                  $toObjectId: '$assignedEmployeeId',
                },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'assignedEmployeeId',
                foreignField: '_id',
                as: 'assignedEmployeeInfo',
              },
            },
            {
              $replaceRoot: {
                newRoot: {
                  $mergeObjects: [
                    { $arrayElemAt: [ '$assignedEmployeeInfo', 0 ] },
                    '$$ROOT',
                  ],
                },
              },
            },
            {
              $addFields: {
                _id: {
                  $toObjectId: '$assignedEmployeeId',
                },
              },
            },
            {
              $project: {
                assignedEmployeeInfo: 0,
                password: 0,
              },
            },
          ])
          .exec();

      if (!assignees) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Record not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(assignees);

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
   * Get assignee by id
   */
  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.params._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const user =
        await AssigneeModel
          .findById(req.params._id)
          .exec();

      if (!user) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Assignee not found', ErrorTypes.FETCH_ERROR));
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
   * Delete single assignee by id
   */
  deleteById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const deletedAssignee =
        await AssigneeModel
          .deleteOne({_id: req.body._id})
          .exec();

      if (!deletedAssignee) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('Assignee not found', ErrorTypes.FETCH_ERROR));
      }

      return res
        .status(ResponseStatus.OK)
        .json(deletedAssignee);
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

export { AssigneeController };
