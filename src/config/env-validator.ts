/**
 * 环境变量验证工具
 * 在应用启动时验证必需的环境变量
 */

interface EnvConfig {
  required: string[];
  optional?: Record<string, string>;
}

const requiredEnvVars: string[] = [
  'JWT_SECRET_KEY',
  'MONGODB_URL',
  'MONGODB_PORT',
  'MONGODB_DATABASE'
];

/**
 * 验证必需的环境变量是否存在
 * @throws {Error} 如果缺少必需的环境变量
 */
export const validateEnv = (): void => {
  const missing: string[] = [];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(
      `缺少必需的环境变量: ${missing.join(', ')}\n` +
      `请检查 .env 文件或环境变量配置。`
    );
  }
  
  // 验证生产环境的安全配置
  if (process.env.NODE_ENV === 'production') {
    const productionWarnings: string[] = [];
    
    // 检查是否使用了默认的 JWT 密钥
    if (process.env.JWT_SECRET_KEY === '4C31F7EFD6857D91E729165510520424') {
      productionWarnings.push('警告: 使用了默认的 JWT_SECRET_KEY，生产环境必须使用强密钥');
    }
    
    // 检查是否使用了默认的管理员密码
    if (
      process.env.SUPER_ADMIN_PASSWORD === '12345678' ||
      process.env.BASIC_ADMIN_PASSWORD === '12345678'
    ) {
      productionWarnings.push('警告: 使用了默认的管理员密码，生产环境必须修改');
    }
    
    if (productionWarnings.length > 0) {
      console.warn('\n⚠️  生产环境安全警告:');
      productionWarnings.forEach(warning => console.warn(`  - ${warning}`));
      console.warn('\n');
    }
  }
};
