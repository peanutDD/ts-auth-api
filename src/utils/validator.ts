/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-13 14:34:59
 * @Description: file content
 */
import validator from "validator";
import { IUserDocument } from "../models/User";

import HttpException from "../exceptions/HttpException";
import StatusCodes from 'http-status-codes'
interface RegisterInputError extends Partial<IUserDocument> {
  confirmPassword?: IUserDocument["password"];
}

export interface LoginInputError extends Partial<IUserDocument> {
  general?: string;
}

let {isEmpty, isLength, isEmail, equals} = validator

export const validateLoginInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"]
) => {
  let errors: LoginInputError = {};

  if (validator.isEmpty(username.trim())) {
    errors.username = "Username must not be empty";
  }

  if (isEmpty(password.trim())) {
    errors.password = "Password must not be empty";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};

export const validateRegisterInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"],
  confirmPassword: IUserDocument["password"],
  email: IUserDocument["email"]
) => {
  let errors: RegisterInputError = {};

  if (isEmpty(username.trim())) {
    errors.username = "Username must not be empty";
  }

  if (!isLength(username.trim(), { min: 6 })) {
    errors.username = "Username must be at least 6 characters long";
  }

  if (isEmpty(password.trim())) {
    errors.password = "Password must not be empty";
  }

  if (isEmpty(confirmPassword.trim())) {
    errors.confirmPassword = "Confirmed password must not be empty";
  }

  if (!equals(password, confirmPassword)) {
    errors.confirmPassword = "Passwords must match";
  }

  if (isEmpty(email.trim())) {
    errors.email = "Email must not be empty";
  }

  if (!isEmail(email)) {
    errors.email = "Email must be a valid email address";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};

export const checkBody = (body: string) => {
  if (isEmpty(body.trim())) {
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, "Body must be not empty", {
      body: "The body must be not empty"
    });
  }
};
