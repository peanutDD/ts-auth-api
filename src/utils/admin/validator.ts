/*
 * @Author: peanut
 * @Date: 2021-04-17 13:46:57
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 13:49:19
 * @Description: file content
 */
import validator from "validator";
import { IAdminDocument } from "../../models/Admin";

export interface InputError extends Partial<IAdminDocument> {
  general?: string;
}

export const validateInput = (
  username: IAdminDocument["username"],
  password: IAdminDocument["password"]
) => {
  let errors: InputError = {};

  const { isEmpty } = validator

  if (isEmpty(username.trim())) {
    errors.username = "Username must not be empty";
  }

  if (isEmpty(password.trim())) {
    errors.password = "Password must not be empty";
  }

  return { errors, valid: Object.keys(errors).length < 1 };
};