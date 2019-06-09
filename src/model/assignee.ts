import * as Joi from 'joi';
import { Schema, model } from 'mongoose';

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
