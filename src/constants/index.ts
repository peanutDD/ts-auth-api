/**
 * 应用常量定义
 * 
 * 集中管理应用中的魔法数字和字符串
 * 提高代码可维护性和可读性
 * 
 * @file src/constants/index.ts
 */

/**
 * 密码哈希配置
 */
export const BCRYPT_ROUNDS = 10;  // bcrypt 哈希轮数，10 是安全性和性能的平衡点

/**
 * Token 配置
 */
export const DEFAULT_TOKEN_EXPIRES_IN = "5d";  // 默认 token 过期时间：5天

/**
 * 用户名验证配置
 */
export const USERNAME_MIN_LENGTH = 6;
export const USERNAME_MAX_LENGTH = 30;

/**
 * 邮箱验证配置
 */
export const EMAIL_MAX_LENGTH = 255;

/**
 * 密码强度要求
 */
export const PASSWORD_MIN_LENGTH = 8;

/**
 * 限流配置
 */
export const RATE_LIMIT = {
  API_WINDOW_MS: 15 * 60 * 1000,  // 15分钟
  API_MAX_REQUESTS: 100,          // 最多100个请求
  AUTH_WINDOW_MS: 15 * 60 * 1000, // 15分钟
  AUTH_MAX_REQUESTS: 5,           // 最多5次尝试
  STRICT_WINDOW_MS: 60 * 60 * 1000, // 1小时
  STRICT_MAX_REQUESTS: 10          // 最多10个请求
};
