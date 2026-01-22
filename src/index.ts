import { Application } from "./app";
import { validateEnv } from "./config/env-validator";

// 验证环境变量
try {
  validateEnv();
} catch (error) {
  console.error("❌ 环境变量验证失败:", error.message);
  process.exit(1);
}

new Application().setupDbAndServer();
