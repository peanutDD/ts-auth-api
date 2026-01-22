/**
 * 环境变量验证模块
 * 
 * 在应用启动时验证必需的环境变量
 * 生产环境必须设置所有必需的环境变量
 * 
 * @file src/config/env-validator.ts
 */

/**
 * 验证环境变量
 * 
 * 检查所有必需的环境变量是否已设置
 * 如果缺少必需的环境变量，抛出错误
 * 
 * @throws {Error} 如果缺少必需的环境变量
 */
export const validateEnv = (): void => {
  const isProduction = process.env.NODE_ENV === "production";
  const isDevelopment = process.env.NODE_ENV === "development";
  const missing: string[] = [];
  const warnings: string[] = [];

  // 生产环境必需的环境变量
  if (isProduction) {
    const requiredVars = [
      "JWT_SECRET_KEY",
      "ADMIN_JWT_SECRET_KEY",
      "MONGODB_URL",
      "MONGODB_PORT",
      "MONGODB_DATABASE",
    ];

    for (const envVar of requiredVars) {
      if (!process.env[envVar]) {
        missing.push(envVar);
      }
    }

    // 检查是否使用了不安全的默认值
    if (process.env.JWT_SECRET_KEY === "4C31F7EFD6857D91E729165510520424") {
      warnings.push("JWT_SECRET_KEY 使用了不安全的默认值，请立即更改");
    }

    if (
      process.env.SUPER_ADMIN_PASSWORD === "12345678" ||
      process.env.BASIC_ADMIN_PASSWORD === "12345678"
    ) {
      warnings.push("管理员密码使用了不安全的默认值，请立即更改");
    }
  }

  // 开发环境建议设置的环境变量
  if (isDevelopment) {
    if (!process.env.JWT_SECRET_KEY) {
      warnings.push("建议在开发环境也设置 JWT_SECRET_KEY");
    }
  }

  // 如果有缺失的必需变量，抛出错误
  if (missing.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missing.join(", ")}\n` +
      `请检查 .env 文件或环境变量配置。`
    );
  }

  // 如果有警告，输出到控制台
  if (warnings.length > 0) {
    console.warn("\n⚠️  环境变量警告:");
    warnings.forEach((warning) => console.warn(`  - ${warning}`));
    console.warn("\n");
  }
};
