/**
 * 应用配置模块
 * 
 * 从环境变量读取配置，并提供默认值
 * 注意：生产环境必须设置所有必需的环境变量，不应依赖默认值
 * 
 * @file src/config/config.ts
 * @author peanut
 * @date 2021-04-13
 * 
 * @warning 默认值仅用于开发环境，生产环境必须通过环境变量配置
 */

import dotenv from "dotenv";
import { DEFAULT_TOKEN_EXPIRES_IN } from "../constants";

dotenv.config();

/**
 * 判断是否为测试环境
 * 用于区分测试环境和开发/生产环境的配置
 */
const isTestEnvironment = process.env.NODE_ENV === "test";

/**
 * 应用配置对象
 * 
 * 包含以下配置：
 * - environment: 运行环境（development/test/production）
 * - host: 服务器监听地址
 * - port: 服务器监听端口
 * - auth: JWT 认证配置
 * - db: 数据库连接配置
 * - superAdmin/basicAdmin: 默认管理员账户（仅开发环境使用）
 * - user: 默认用户账户（仅开发环境使用）
 * - logging: 日志配置
 */
export default {
  // 运行环境
  environment: process.env.NODE_ENV || "development",
  
  // 服务器配置
  host: process.env.APP_HOST || "127.0.0.1",
  port:
    (isTestEnvironment ? process.env.TEST_APP_PORT : process.env.APP_PORT) ||
    "6060",
  
  // JWT 认证配置
  // 开发环境使用默认值，生产环境必须通过环境变量设置
  auth: {
    secretKey: process.env.JWT_SECRET_KEY || (process.env.NODE_ENV === "production" ? "" : "4C31F7EFD6857D91E729165510520424"),
    adminSecretKey:
      process.env.ADMIN_JWT_SECRET_KEY || (process.env.NODE_ENV === "production" ? "" : "4C31F7EFD6857D91E729165510520424"),
    // Token 过期时间配置（从环境变量读取，默认5天）
    expiresIn: (process.env.JWT_EXPIRES_IN || DEFAULT_TOKEN_EXPIRES_IN) as string
  },
  
  // 数据库配置
  // 根据环境选择不同的数据库配置
  db: {
    host: isTestEnvironment
      ? process.env.TEST_MONGODB_URL
      : process.env.MONGODB_URL,
    port: isTestEnvironment
      ? process.env.TEST_MONGODB_PORT
      : process.env.MONGODB_PORT,
    database: isTestEnvironment
      ? process.env.TEST_MONGODB_DATABASE
      : process.env.MONGODB_DATABASE
  },
  
  // 超级管理员配置（仅开发环境使用）
  // 生产环境必须通过环境变量设置，不应使用默认值
  superAdmin: {
    username: process.env.SUPER_ADMIN_USERNAME || (process.env.NODE_ENV === "production" ? "" : "peanut"),
    password: process.env.SUPER_ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "12345678")
  },
  
  // 普通管理员配置（仅开发环境使用）
  // 生产环境必须通过环境变量设置，不应使用默认值
  basicAdmin: {
    username: process.env.BASIC_ADMIN_USERNAME || (process.env.NODE_ENV === "production" ? "" : "ben"),
    password: process.env.BASIC_ADMIN_PASSWORD || (process.env.NODE_ENV === "production" ? "" : "12345678")
  },
  
  // 默认用户配置（仅开发环境使用）
  // 生产环境必须通过环境变量设置，不应使用默认值
  user: {
    username: process.env.USERNAME || (process.env.NODE_ENV === "production" ? "" : "bird"),
    password: process.env.PASSWORD || (process.env.NODE_ENV === "production" ? "" : "12345678"),
    email: process.env.EMAIL || (process.env.NODE_ENV === "production" ? "" : "hfpp2012@gmail.com")
  },
  
  // 日志配置
  logging: {
    dir: process.env.LOGGING_DIR || "logs",
    level: process.env.LOGGING_LEVEL || "debug"
  }
};
