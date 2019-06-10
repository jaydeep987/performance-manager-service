import { Request, Response } from 'express';
import * as Joi from 'joi';
import * as jwt from 'jsonwebtoken';
import { ErrorTypes, ResponseStatus } from '~common/constants';
import { ControllerBase } from '~lib/controller-base';
import { JWT_SECRET } from '~lib/jwt-middleware';
import { AssigneeModel } from '~model/assignee';
import { FeedbackModel } from '~model/feedback';
import { ReviewModel } from '~model/review';
import { UserModel, authValidationSchema, userValidationSchema } from '~model/user';
import { Logger } from '~utils/logger';

/**
 * Controller for handling user related routes
 */
class UserController extends ControllerBase {

  /** Controller name to use in logs */
  private readonly controllerName = 'UserController';

  /**
   * Creates new user in database
   */
  create = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { value, error } = Joi.validate(req.body, userValidationSchema);

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

      // Check if same user name already exists
      let user = await UserModel
        .findOne({ userName: value.userName })
        .exec();

      if (user) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse(`Username ${value.userName} already exists`, ErrorTypes.VALIDATION_ERROR));
      }

      user = await UserModel.create(value);

      return res
        .status(ResponseStatus.OK_CREATED)
        .json(user);

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
   * Authenticates user who is trying to login
   */
  authenticate = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { value, error } = Joi.validate(req.body, authValidationSchema);

      if (error && error.details) {
        Logger.error({
          message: 'Validation error',
          prefix: `${this.controllerName}:authenticate`,
          extraInfo: error.details,
        });

        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse(error, ErrorTypes.VALIDATION_ERROR));
      }

      const user = await UserModel
        .findOne({ userName: value.userName })
        .exec();

      if (user && value.password === user.get('password')) {
        const { password, ...userWithoutPassword } = user.toObject();
        const token = jwt.sign({ sub: user.get('userName') }, JWT_SECRET);

        // We won't send token client side in response, we will store in httpOnly cookie
        // Also store user id in cookie
        res.cookie('token', { token, userId: userWithoutPassword._id }, { httpOnly: true });

        return res
          .status(ResponseStatus.OK)
          .json({
            ...userWithoutPassword,
          });
      }

      return res
        .status(ResponseStatus.AUTH_FAILED)
        .json(this.wrapErrorResponse('Username or Password does not match', ErrorTypes.VALIDATION_ERROR));

    } catch (error) {
      Logger.error({
        message: 'Authentication error',
        prefix: `${this.controllerName}:authenticate`,
        extraInfo: error,
      });

      return res
        .status(ResponseStatus.INTERNAL_ERROR)
        .json(this.wrapErrorResponse(error, ErrorTypes.INTERNAL_ERROR));
    }
  }

  /**
   * When user try to logout, we need to remove cookie from server also
   * to invalidate token.
   */
  logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('token');
    res
      .status(ResponseStatus.OK)
      .send();
  }

  /**
   * Get all users
   */
  getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const users =
        await UserModel
          .find()
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
   * Get user by id
   */
  getById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.params.id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id parameter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const user =
        await UserModel
          .findById(req.params.id)
          .exec();

      if (!user) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('User not found', ErrorTypes.FETCH_ERROR));
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
   * Updates user, finding by id
   * If user is trying to change username, and if that username is already exists, then dont allow
   */
  update = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    try {
      const user = await UserModel
        .findById(req.body._id)
        .exec();

      if (!user) {
        return res
          .status(ResponseStatus.BAD_REQUEST)
          .json(this.wrapErrorResponse('User Not Found', ErrorTypes.PARAM_ERROR));
      }

      if (user.get('userName') !== req.body.userName) {
        const foundUserByUserName = await UserModel
          .findOne({ userName: req.body.userName })
          .exec();

        if (foundUserByUserName) {
          return res
            .status(ResponseStatus.BAD_REQUEST)
            .json(
              this.wrapErrorResponse('Username you are trying to change is already exists', ErrorTypes.PARAM_ERROR),
            );
        }
      }

      const { _id, ...userWithoutId } = req.body;

      Object
        .keys(userWithoutId)
        .forEach((path) => {
          user.set(path, req.body[path]);
        });

      await user.save();

      return res
        .status(ResponseStatus.OK)
        .json(user);
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
   * Delete single user by id
   */
  deleteById = async (req: Request, res: Response): Promise<Response> => {
    if (!req.body._id) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('Missing Id paramter', ErrorTypes.PARAM_ERROR));
    }

    // User should not delete himself!
    if (req.body._id === req.cookies.token.userId) {
      return res
        .status(ResponseStatus.BAD_REQUEST)
        .json(this.wrapErrorResponse('You should not delete yourself!!', ErrorTypes.PARAM_ERROR));
    }

    try {
      const deletedUser =
        await UserModel
          .deleteOne({_id: req.body._id})
          .exec();

      if (!deletedUser) {
        return res
          .status(ResponseStatus.NOT_FOUND)
          .json(this.wrapErrorResponse('User not found', ErrorTypes.FETCH_ERROR));
      }

      // Need to delete all refs of users from other collections
      // TODO: Might be better way to delete together
      // Also transactions
      await AssigneeModel
        .deleteMany({
          assigneeId: req.body._id,
        })
        .exec();
      await AssigneeModel
        .deleteMany({
          assignedEmployeeId: req.body._id,
        })
        .exec();
      await ReviewModel
        .deleteMany({
          employeeId: req.body._id,
        })
        .exec();
      await ReviewModel
        .deleteMany({
          updatedBy: req.body._id,
        })
        .exec();
      await FeedbackModel
        .deleteMany({
          employeeId: req.body._id,
        })
        .exec();

      return res
        .status(ResponseStatus.OK)
        .json(deletedUser);
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

export { UserController };
