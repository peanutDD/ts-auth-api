/**
 * 输入验证工具模块
 * 
 * 提供用户注册和登录输入验证功能
 * 使用 validator 库进行数据验证
 * 
 * @file src/utils/validator.ts
 * @author peanut
 * @date 2021-04-13
 */

import validator from "validator";
import { IUserDocument } from "../models/User";
import HttpException from "../exceptions/HttpException";
import StatusCodes from 'http-status-codes';
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, EMAIL_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../constants";

/**
 * 注册输入错误接口
 * 扩展了用户文档的部分字段，并添加确认密码字段
 */
interface RegisterInputError extends Partial<IUserDocument> {
  confirmPassword?: IUserDocument["password"];
}

/**
 * 登录输入错误接口
 * 扩展了用户文档的部分字段，并添加通用错误消息字段
 */
export interface LoginInputError extends Partial<IUserDocument> {
  general?: string;
}

// 从 validator 库中解构常用的验证方法
const {isEmpty, isLength, isEmail, equals, matches} = validator;

/**
 * 密码强度验证
 * 
 * 要求：
 * - 至少8个字符
 * - 包含小写字母
 * - 包含大写字母
 * - 包含数字
 * - 包含特殊字符
 * 
 * @param {string} password - 待验证的密码
 * @returns {boolean} 如果密码符合强度要求返回 true，否则返回 false
 */
export const validatePasswordStrength = (password: string): boolean => {
  // 至少8个字符
  if (password.length < PASSWORD_MIN_LENGTH) return false;
  
  // 包含小写字母
  if (!/[a-z]/.test(password)) return false;
  
  // 包含大写字母
  if (!/[A-Z]/.test(password)) return false;
  
  // 包含数字
  if (!/[0-9]/.test(password)) return false;
  
  // 包含特殊字符
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return false;
  
  return true;
};

/**
 * 验证用户登录输入
 * 
 * 检查用户名和密码是否为空
 * 
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {{errors: LoginInputError, valid: boolean}} 返回错误对象和验证结果
 * 
 * @example
 * const {errors, valid} = validateLoginInput("testuser", "password123");
 * if (!valid) {
 *   // 处理验证错误
 * }
 */
export const validateLoginInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"]
) => {
  let errors: LoginInputError = {};

  // 检查用户名是否存在且非空（去除首尾空格后检查）
  if (!username || validator.isEmpty(username.trim())) {
    errors.username = "Username must not be empty";
  }

  // 检查密码是否存在且非空（去除首尾空格后检查）
  if (!password || isEmpty(password.trim())) {
    errors.password = "Password must not be empty";
  }

  // 如果没有错误，则验证通过
  return { errors, valid: Object.keys(errors).length < 1 };
};

/**
 * 验证用户注册输入
 * 
 * 验证用户名、密码、确认密码和邮箱的格式和有效性
 * 
 * @param {string} username - 用户名（至少6个字符）
 * @param {string} password - 密码
 * @param {string} confirmPassword - 确认密码（必须与密码匹配）
 * @param {string} email - 邮箱地址（必须是有效格式）
 * @returns {{errors: RegisterInputError, valid: boolean}} 返回错误对象和验证结果
 * 
 * @example
 * const {errors, valid} = validateRegisterInput(
 *   "testuser",
 *   "password123",
 *   "password123",
 *   "test@example.com"
 * );
 */
export const validateRegisterInput = (
  username: IUserDocument["username"],
  password: IUserDocument["password"],
  confirmPassword: IUserDocument["password"],
  email: IUserDocument["email"]
) => {
  let errors: RegisterInputError = {};

  // 验证用户名：不能为空，长度6-30个字符，只能包含字母、数字和下划线
  const trimmedUsername = username ? username.trim() : "";
  if (!username || isEmpty(trimmedUsername)) {
    errors.username = "Username must not be empty";
  } else if (!isLength(trimmedUsername, { min: USERNAME_MIN_LENGTH, max: USERNAME_MAX_LENGTH })) {
    errors.username = `Username must be between ${USERNAME_MIN_LENGTH} and ${USERNAME_MAX_LENGTH} characters long`;
  } else if (!matches(trimmedUsername, /^[a-zA-Z0-9_]+$/)) {
    errors.username = "Username can only contain letters, numbers, and underscores";
  }

  // 验证密码：不能为空，且必须符合强度要求
  if (!password || isEmpty(password.trim())) {
    errors.password = "Password must not be empty";
  } else if (!validatePasswordStrength(password)) {
    errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters and contain uppercase, lowercase, number, and special character`;
  }

  // 验证确认密码：不能为空
  if (!confirmPassword || isEmpty(confirmPassword.trim())) {
    errors.confirmPassword = "Confirmed password must not be empty";
  }

  // 验证密码和确认密码是否匹配（只有当两者都存在时才检查）
  if (password && confirmPassword && !equals(password, confirmPassword)) {
    errors.confirmPassword = "Passwords must match";
  }

  // 验证邮箱：不能为空，且必须是有效的邮箱格式，最大长度255
  const trimmedEmail = email ? email.trim() : "";
  if (!email || isEmpty(trimmedEmail)) {
    errors.email = "Email must not be empty";
  } else if (!isLength(trimmedEmail, { max: EMAIL_MAX_LENGTH })) {
    errors.email = `Email must not exceed ${EMAIL_MAX_LENGTH} characters`;
  } else if (!isEmail(trimmedEmail)) {
    errors.email = "Email must be a valid email address";
  }

  // 如果没有错误，则验证通过
  return { errors, valid: Object.keys(errors).length < 1 };
};

/**
 * 检查请求体是否为空
 * 
 * 用于验证 POST/PUT 请求的请求体内容
 * 如果请求体为空，抛出 422 状态码的异常
 * 
 * @param {string} body - 请求体内容
 * @throws {HttpException} 如果请求体为空，抛出 422 异常
 * 
 * @example
 * checkBody(req.body.content); // 如果 content 为空，会抛出异常
 */
export const checkBody = (body: string) => {
  if (isEmpty(body.trim())) {
    throw new HttpException(StatusCodes.UNPROCESSABLE_ENTITY, "Body must be not empty", {
      body: "The body must be not empty"
    });
  }
};
