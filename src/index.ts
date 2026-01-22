/**
 * 应用程序入口文件
 * 
 * 功能：
 * 1. 验证必需的环境变量
 * 2. 初始化应用实例并启动服务器
 * 
 * @file src/index.ts
 * @author peanut
 */

import { Application } from "./app";
import { validateEnv } from "./config/env-validator";

/**
 * 验证环境变量
 * 在应用启动前检查必需的环境变量是否已配置
 * 如果验证失败，应用将退出并显示错误信息
 */
try {
  validateEnv();
} catch (error: any) {
  console.error("❌ 环境变量验证失败:", error.message);
  process.exit(1);
}

/**
 * 创建应用实例并启动服务器
 * setupDbAndServer 方法会依次执行：
 * 1. 连接数据库
 * 2. 启动 HTTP 服务器
 * 3. 创建默认用户
 * 4. 创建默认管理员
 */
new Application().setupDbAndServer();
