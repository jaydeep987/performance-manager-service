import * as Joi from 'joi';
import { Schema, model } from 'mongoose';

const ReviewSchema = new Schema({
  description: {
    type: String,
    required: 'Enter review description',
  },
  employeeId: {
    type: String,
    required: 'Enter ID of employee for which review was written',
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

const reviewValidationSchema = Joi
  .object()
  .keys({
    description: Joi
      .string()
      .required(),
    employeeId: Joi
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

const ReviewModel = model('Review', ReviewSchema);

export { ReviewModel, reviewValidationSchema };
