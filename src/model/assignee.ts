import * as Joi from 'joi';
import { Schema, model } from 'mongoose';

import { User } from './user';

export interface Assignee {
  /** Assignee id */
  assigneeId: string;
  /** Assigned employee id to whome assignees are assigned */
  assignedEmployeeId: string;
  /** Document created by */
  createdBy?: string;
  /** Document created date */
  createdDate?: string;
  /** Document updated date */
  updatedBy?: string;
  /** Document updated date */
  updatedDate?: string;
  /** Assignee's info (as it's User) */
  assigneeInfo?: User[];
}

const AssigneeSchema = new Schema({
  assigneeId: {
    type: String,
    required: 'Assignee ID is required',
  },
  assignedEmployeeId: {
    type: String,
    required: 'Assigned Employee ID is required',
  },
  createdBy: {
    type: String,
  },
  createdDate: {
    type: String,
  },
  updatedBy: {
    type: String,
    required: true,
  },
  updatedDate: {
    type: String,
    required: true,
  },
});

const assigneeValidationSchema = Joi
  .object()
  .keys({
    assigneeId: Joi
      .string()
      .required(),
    assignedEmployeeId: Joi
      .string()
      .required(),
    createdDate: Joi
      .string()
      .optional(),
    createdBy: Joi
      .string()
      .optional(),
    updatedDate: Joi
      .string()
      .optional(),
    updatedBy: Joi
      .string()
      .optional(),
  });

const AssigneeModel = model('Assignee', AssigneeSchema);

export { AssigneeModel, assigneeValidationSchema };
