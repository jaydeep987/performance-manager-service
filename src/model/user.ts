import * as Joi from 'joi';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
  userName: {
    type: String,
    required: 'Enter username',
  },
  firstName: {
    type: String,
    required: 'Enter first name',
  },
  lastName: {
    type: String,
    required: 'Enter last name',
  },
  sex: {
    type: String,
    required: 'Enter sex',
  },
  role: {
    type: String,
    required: 'Enter role',
  },
  password: {
    type: String,
    required: 'Enter password',
  },
  created_date: {
    type: Date,
    default: Date.now(),
  },
  created_by: {
    type: String,
  },
  updated_date: {
    type: Date,
  },
  updated_by: {
    type: String,
  },
});

const userValidationSchema = Joi
  .object()
  .keys({
    userName: Joi
      .string()
      .required(),
    password: Joi
      .string()
      .required(),
    firstName: Joi
      .string()
      .required(),
    lastName: Joi
      .string()
      .required(),
    sex: Joi
      .string()
      .required(),
    role: Joi
      .string()
      .required(),
    created_date: Joi
      .string()
      .optional(),
    created_by: Joi
      .string()
      .optional(),
    updated_date: Joi
      .string()
      .optional(),
    updated_by: Joi
      .string()
      .optional(),
  });

const authValidationSchema = Joi
  .object()
  .keys({
    userName: Joi
      .string()
      .required(),
    password: Joi
      .string()
      .required(),
  });

const UserModel = model('User', UserSchema);

export { UserModel, userValidationSchema, authValidationSchema };
