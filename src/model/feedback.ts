import * as Joi from 'joi';
import { Schema, model } from 'mongoose';

const FeedbackSchema = new Schema({
  feedback: {
    type: String,
    required: 'Enter review description',
  },
  reviewId: {
    type: String,
    required: 'Enter Review ID',
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

const feedbackValidationSchema = Joi
  .object()
  .keys({
    feedback: Joi
      .string()
      .required(),
    reviewId: Joi
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

const FeedbackModel = model('Feedback', FeedbackSchema);

export { FeedbackModel, feedbackValidationSchema };
