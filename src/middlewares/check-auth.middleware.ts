/**
 * 用户认证中间件
 * 
 * 验证请求中的 JWT token，并将用户信息附加到请求对象上
 * 用于保护需要用户登录才能访问的路由
 * 
 * @file src/middlewares/check-auth.middleware.ts
 * @author peanut
 * @date 2021-04-13
 */

import { Response, NextFunction, Request } from "express";
import StatusCodes from "http-status-codes";
import HttpException from "../exceptions/HttpException";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/Jwt";
import User from "../models/User";
import config from "../config/config";

const { UNAUTHORIZED } = StatusCodes;

/**
 * 用户认证中间件函数
 * 
 * 验证流程：
 * 1. 检查请求头中是否存在 Authorization 字段
 * 2. 提取 Bearer token
 * 3. 验证 token 的有效性
 * 4. 根据 token 中的用户 ID 查找用户
 * 5. 将用户信息附加到 req.currentUser
 * 
 * @param {Request} req - Express 请求对象
 * @param {Response} _res - Express 响应对象（未使用）
 * @param {NextFunction} next - Express 下一个中间件函数
 * 
 * @throws {HttpException} 401 - 如果认证失败（token 无效、过期、用户不存在等）
 * 
 * @example
 * router.get("/profile", checkAuthMiddleware, getUserProfile);
 */
const checkAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  // 从请求头中获取 Authorization 字段
  const authorizationHeader = req.headers["authorization"];

  if (authorizationHeader) {
    // 提取 Bearer token（格式：Bearer <token>）
    const token = authorizationHeader.split("Bearer ")[1];

    if (token) {
      try {
        // 验证 token 并解析 payload
        const jwtData = jwt.verify(token, config.auth.secretKey) as JwtPayload;

        // 根据 token 中的用户 ID 查找用户
        // 注意：这里不需要密码字段，所以使用默认查询（不包含密码）
        const user = await User.findById(jwtData.id);

        if (user) {
          // 将用户信息附加到请求对象，供后续中间件和控制器使用
          req.currentUser = user;
          return next();
        } else {
          // 用户不存在（可能已被删除）
          return next(new HttpException(UNAUTHORIZED, "No such user"));
        }
      } catch (error) {
        // Token 验证失败（无效、过期、签名错误等）
        return next(new HttpException(UNAUTHORIZED, "Invalid/Expired token"));
      }
    }

    // Token 格式错误（缺少 Bearer 前缀或 token 为空）
    return next(
      new HttpException(
        UNAUTHORIZED,
        "Authorization token must be 'Bearer [token]"
      )
    );
  }

  // 缺少 Authorization 请求头
  next(
    new HttpException(UNAUTHORIZED, "Authorization header must be provided")
  );
};

export default checkAuthMiddleware;
