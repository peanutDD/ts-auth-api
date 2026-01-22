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
 * 限制：15分钟内最多5次失败的登录/注册尝试
 * 防止暴力破解攻击
 * 
 * 重要：只对失败的请求进行限流
 * - 成功的登录/注册请求不计入限制（skipSuccessfulRequests: true）
 * - 只有返回 4xx 或 5xx 状态码的请求才会被计入限制
 * - 允许失败5次，第6次失败时才开始限流
 * - 这样用户可以正常登录，但恶意尝试会被限制
 * 
 * 注意：max: 5 意味着最多允许5个失败的请求被计数
 * - 失败1-5次：正常处理，返回错误信息
 * - 失败第6次：开始限流，返回限流错误
 */
export const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.AUTH_WINDOW_MS,
  max: RATE_LIMIT.AUTH_MAX_REQUESTS,  // max: 5 意味着允许5次失败，第6次才限流
  message: {
    success: false,
    message: '登录/注册失败次数过多，请15分钟后再试'
  },
  // 自定义请求是否成功的判断逻辑
  // 只有当响应状态码为 2xx 时才认为是成功请求
  requestWasSuccessful: (_req, res) => {
    return res.statusCode >= 200 && res.statusCode < 300;
  },
  standardHeaders: true,
  legacyHeaders: false,
  // 关键配置：成功请求（2xx 状态码）不计入限制
  // 只有失败的请求（4xx/5xx）才会被计入限流计数
  skipSuccessfulRequests: true,
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
