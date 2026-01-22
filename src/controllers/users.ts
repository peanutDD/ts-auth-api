/**
 * 用户控制器
 * 
 * 处理用户相关的 HTTP 请求，包括：
 * - 用户登录
 * - 用户注册
 * 
 * @file src/controllers/users.ts
 */

import { Request, Response } from 'express';
import {
  validateRegisterInput,
  validateLoginInput,
  LoginInputError
} from "../utils/validator";
import HttpException from "../exceptions/HttpException";
import StatusCodes from "http-status-codes";
import User, { IUserDocument } from "../models/User";
import bcrypt from "bcryptjs";
import { wrapAsync } from "../helpers/wrap-async";
import { BCRYPT_ROUNDS } from "../constants";

const { UNPROCESSABLE_ENTITY } = StatusCodes;

/**
 * 抛出登录验证错误
 * 
 * 统一的登录验证错误处理函数
 * 
 * @param {LoginInputError} errors - 登录输入错误对象
 * @throws {HttpException} 抛出 422 状态码的异常
 */
const throwLoginValidateError = (errors: LoginInputError): never => {
  throw new HttpException(
    UNPROCESSABLE_ENTITY,
    "User login input error",
    errors
  );
};

/**
 * 用户登录控制器
 * 
 * 处理用户登录请求：
 * 1. 验证输入（用户名和密码不能为空）
 * 2. 查找用户
 * 3. 验证密码
 * 4. 生成 JWT token 并返回
 * 
 * @route POST /api/users/login
 * @access Public
 * 
 * @param {Request} req - Express 请求对象，包含 username 和 password
 * @param {Response} res - Express 响应对象
 * @returns {Promise<void>}
 * 
 * @throws {HttpException} 422 - 输入验证失败
 * @throws {HttpException} 422 - 用户不存在或密码错误
 */
export const postLogin = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    // 从请求体中提取用户名和密码
    const { username, password } = req.body;

    // 验证输入：检查用户名和密码是否为空
    const { errors, valid } = validateLoginInput(username, password);

    if (!valid) {
      return throwLoginValidateError(errors);
    }

    // 根据用户名查找用户
    // 注意：由于 User 模型中 password 字段设置了 select: false，
    // 需要使用 .select('+password') 显式包含密码字段用于验证
    const user = await User.findOne({ username }).select('+password');

    // 如果用户不存在，返回错误
    if (!user) {
      errors.general = "User not found";
      return throwLoginValidateError(errors);
    }

    // 使用 bcrypt 比较明文密码和哈希密码
    const match = await bcrypt.compare(password, user.password);

    // 如果密码不匹配，返回错误
    if (!match) {
      errors.general = "Wrong credentials";
      return throwLoginValidateError(errors);
    }

    // 生成 JWT token
    const token = user.generateToken();

    // 返回成功响应，包含用户信息和 token
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        token
      }
    });
  }
);

/**
 * 用户注册控制器
 * 
 * 处理用户注册请求：
 * 1. 验证输入（用户名、密码、确认密码、邮箱）
 * 2. 检查用户名是否已存在
 * 3. 对密码进行哈希处理
 * 4. 创建新用户
 * 5. 生成 JWT token 并返回
 * 
 * @route POST /api/users/register
 * @access Public
 * 
 * @param {Request} req - Express 请求对象，包含 username, password, confirmPassword, email
 * @param {Response} res - Express 响应对象
 * @returns {Promise<void>}
 * 
 * @throws {HttpException} 422 - 输入验证失败
 * @throws {HttpException} 422 - 用户名已被使用
 */
export const postRegister = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    // 从请求体中提取注册信息
    const { username, password, confirmPassword, email } = req.body;

    // 验证输入：检查用户名长度、密码匹配、邮箱格式等
    const { errors, valid } = validateRegisterInput(
      username,
      password,
      confirmPassword,
      email
    );

    // 如果验证失败，抛出异常
    if (!valid) {
      throw new HttpException(
        UNPROCESSABLE_ENTITY,
        "User register input error",
        errors
      );
    }

    // 检查用户名是否已被使用
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      throw new HttpException(UNPROCESSABLE_ENTITY, "Username is taken", {
        username: "该用户名已被使用"
      });
    }

    // 检查邮箱是否已被使用
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      throw new HttpException(UNPROCESSABLE_ENTITY, "Email is taken", {
        email: "该邮箱已被使用"
      });
    }

    // 使用 bcrypt 对密码进行哈希处理
    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // 创建新用户实例
    const newUser: IUserDocument = new User({
      username,
      email,
      password: hashedPassword
    });

    // 保存用户到数据库
    const resUser: IUserDocument = await newUser.save();

    // 生成 JWT token
    const token: string = resUser.generateToken();

    // 返回成功响应，包含用户信息和 token
    res.json({
      success: true,
      data: {
        id: resUser.id,
        username: resUser.username,
        token
      }
    });
  }
);
