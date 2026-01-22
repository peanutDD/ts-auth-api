/**
 * 请求限流中间件
 * 
 * 防止暴力破解和 DDoS 攻击
 * 使用 express-rate-limit 实现请求频率限制
 * 
 * @file src/middlewares/rate-limit.middleware.ts
 */

import rateLimit from 'express-rate-limit';
import config from '../config/config';
import { RATE_LIMIT } from '../constants';

/**
 * 通用 API 限流配置
 * 
 * 限制：15分钟内最多100个请求
 * 适用于大多数 API 端点
 */
export const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.API_WINDOW_MS,
  max: RATE_LIMIT.API_MAX_REQUESTS,
  message: {
    success: false,
    message: '请求过于频繁，请稍后再试'
  },
  standardHeaders: true, // 返回限流信息到 `RateLimit-*` 头
  legacyHeaders: false, // 禁用 `X-RateLimit-*` 头
  // 根据环境调整限流策略
  skip: () => config.environment === "test", // 测试环境跳过限流
});

/**
 * 登录/注册限流配置
 * 
 * 限制：15分钟内最多5次尝试
 * 防止暴力破解攻击
 * 成功请求不计入限制（skipSuccessfulRequests: true）
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,
  message: {
    success: false,
    message: '登录/注册尝试次数过多，请15分钟后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功请求不计入限制
  skip: () => config.environment === "test", // 测试环境跳过限流
});

/**
 * 严格限流配置（用于敏感操作）
 * 
 * 限制：1小时内最多10个请求
 * 适用于删除、修改密码等敏感操作
 */
export const strictLimiter = rateLimit({
  windowMs: RATE_LIMIT.STRICT_WINDOW_MS,
  max: RATE_LIMIT.STRICT_MAX_REQUESTS,
  message: {
    success: false,
    message: '操作过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => config.environment === "test", // 测试环境跳过限流
});
