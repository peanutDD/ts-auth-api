/**
 * Express 应用主类
 * 
 * 负责初始化 Express 应用、配置中间件、连接数据库、启动服务器
 * 
 * @file src/app.ts
 */

import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import errorMiddleware from "./middlewares/error.middleware";
import "dotenv/config";
import config from "./config/config";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";
import { apiLimiter } from "./middlewares/rate-limit.middleware";
import { Logger, ILogger } from "./utils/logger";
import notFoundError from "./middlewares/notFoundHandler.middleware";
import User from "./models/User";
import Admin from "./models/Admin";
import bcrypt from "bcryptjs";
import { BCRYPT_ROUNDS } from "./constants";

/**
 * 应用主类
 * 
 * 封装了 Express 应用的初始化和配置逻辑
 */
export class Application {
  app: Express;           // Express 应用实例
  config = config;       // 应用配置
  logger: ILogger;       // 日志记录器

  /**
   * 构造函数
   * 初始化 Express 应用并配置所有中间件
   */
  constructor() {
    this.logger = new Logger(__filename);
    this.app = express();
    
    // 应用监控中间件（显示服务器状态）
    this.app.use(require("express-status-monitor")());
    
    // 安全中间件：设置各种 HTTP 安全头
    this.app.use(helmet());
    
    // CORS 中间件：允许跨域请求
    // 根据环境配置不同的 CORS 策略
    const corsOptions = {
      origin: config.environment === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") || false  // 生产环境限制来源
        : true,  // 开发环境允许所有来源
      credentials: true,
      optionsSuccessStatus: 200
    };
    this.app.use(cors(corsOptions));
    
    // HTTP 请求日志中间件
    // 在测试环境中跳过日志记录
    this.app.use(
      morgan("dev", {
        skip: () => config.environment === "test",
      })
    );

    // 解析 JSON 请求体
    this.app.use(express.json());
    
    // 解析 URL 编码的请求体
    this.app.use(express.urlencoded({ extended: true }));

    // 根路径路由
    this.app.get("/", (_req: Request, res: Response) => {
      res.json({
        message: "hello world",
      });
    });

    // 应用通用 API 限流（排除根路径）
    this.app.use((req, res, next) => {
      if (req.path === '/') {
        return next();
      }
      return apiLimiter(req, res, next);
    });

    // API 路由
    this.app.use("/api", routes);

    // 404 错误处理（必须在所有路由之后）
    this.app.use(notFoundError);

    // 全局错误处理中间件（必须在最后）
    this.app.use(errorMiddleware);
  }

  /**
   * 设置数据库并启动服务器
   * 
   * 按顺序执行：
   * 1. 连接数据库
   * 2. 启动 HTTP 服务器
   * 3. 创建默认用户（如果不存在）
   * 4. 创建默认管理员（如果不存在）
   * 
   * ⚠️ 注意：在生产环境中，应该使用数据库迁移工具管理初始数据
   */
  setupDbAndServer = async () => {
    await this.setupDb();
    await this.startServer();
    await this.createUser();
    await this.createAdmin();
  };

  /**
   * 连接 MongoDB 数据库
   * 
   * 支持多种连接方式：
   * 1. 无认证连接（开发环境）
   * 2. 使用 authSource=admin 的认证连接
   * 3. 使用目标数据库作为认证源的连接
   * 
   * 如果所有连接方式都失败，会抛出错误
   * 
   * @throws {Error} 如果数据库连接失败
   */
  setupDb = async () => {
    try {
      // 检查必需的数据库配置是否存在
      if (!config.db.host || !config.db.port || !config.db.database) {
        throw new Error('Missing database configuration');
      }
      
      this.logger.debug(`DB Config - Host: ${config.db.host}, Port: ${config.db.port}, DB: ${config.db.database}`);
      this.logger.debug(`Admin Credentials - Username: ${config.superAdmin.username}`);
      
      // 首先尝试无认证连接（大多数开发环境适用）
      let noAuthMongoUrl = '';
      if (config.db.host.startsWith('mongodb://')) {
        noAuthMongoUrl = `${config.db.host}:${config.db.port}/${config.db.database}`;
      } else {
        noAuthMongoUrl = `mongodb://${config.db.host}:${config.db.port}/${config.db.database}`;
      }
      
      try {
        await mongoose.connect(noAuthMongoUrl);
        this.logger.info(`Connected to database without authentication. Connection: ${noAuthMongoUrl}`);
        this.logger.info('Note: MongoDB is running without authentication. For production, enable authentication and create users.');
      } catch (noAuthError) {
        // 如果无认证连接失败，尝试使用认证
        this.logger.warn(`No-auth connection failed: ${noAuthError.message}, trying with authentication...`);
        
        // 正确处理host格式，避免重复添加mongodb://前缀
        const hostWithoutPrefix = config.db.host.startsWith('mongodb://') 
          ? config.db.host.replace('mongodb://', '') 
          : config.db.host;
        
        // 尝试使用authSource=admin进行认证
        const authMongoUrlWithAdminDb = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix}:${config.db.port}/${config.db.database}?authSource=admin`;
        
        try {
          await mongoose.connect(authMongoUrlWithAdminDb);
          this.logger.info(`Connected to database with authentication using authSource=admin. Connection: mongodb://${config.superAdmin.username}:******@${hostWithoutPrefix}:${config.db.port}/${config.db.database}`);
        } catch (adminDbError) {
          // 如果失败，尝试直接使用目标数据库作为认证源
          this.logger.warn(`Authentication with authSource=admin failed: ${adminDbError.message}`);
          const authMongoUrlWithDb = `mongodb://${config.superAdmin.username || ''}:${config.superAdmin.password || ''}@${hostWithoutPrefix}:${config.db.port}/${config.db.database}`;
          
          try {
            await mongoose.connect(authMongoUrlWithDb);
            this.logger.info(`Connected to database with authentication. Connection: mongodb://${config.superAdmin.username}:******@${hostWithoutPrefix}:${config.db.port}/${config.db.database}`);
          } catch (dbError) {
            // 如果所有认证方式都失败，记录详细错误信息并抛出异常
            this.logger.error(`All connection attempts failed: ${dbError.message}`);
            this.logger.error('Please check your MongoDB configuration. Possible issues:');
            this.logger.error('1. MongoDB server is not running');
            this.logger.error('2. Authentication is enabled but user credentials are incorrect');
            this.logger.error('3. Network issues preventing connection to MongoDB');
            throw new Error(`Failed to connect to database: ${dbError.message}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Database connection error: ${error.message}`);
      if (error.name === 'MongoSecurityException') {
        this.logger.error('Authentication failed. Please check your MongoDB user credentials and authentication database.');
        this.logger.error('If running MongoDB locally, you may need to:');
        this.logger.error('1. Create a user with the correct privileges in MongoDB');
        this.logger.error('2. Ensure MongoDB authentication is properly configured');
        this.logger.error('3. Verify the authentication database (usually "admin")');
      }
      throw error;
    }
  };

  /**
   * 启动 HTTP 服务器
   * 
   * 在指定的主机和端口上启动 Express 服务器
   * 
   * @returns {Promise<boolean>} 服务器启动成功返回 true
   * 
   * @throws {Error} 如果端口被占用或其他错误
   */
  startServer = (): Promise<boolean> => {
    return new Promise((resolve, _reject) => {
      this.app
        .listen(+this.config.port, this.config.host, () => {
          this.logger.info(
            `Server started at http://${this.config.host}:${this.config.port}`
          );
          resolve(true);
        })
        .on("error", (err) => console.error(err));
    });
  };

  /**
   * 创建默认用户
   * 
   * 如果配置的默认用户不存在，则创建它
   * 主要用于开发环境快速启动
   * 
   * ⚠️ 注意：生产环境不应该使用此方法，应该通过数据库迁移或种子脚本管理用户
   * 
   * @returns {Promise<void>}
   */
  createUser = async (): Promise<void> => {
    try {
      // 检查用户是否已存在
      const user = await User.findOne({ username: config.user.username });
      if (user) return;

      // 对密码进行哈希处理
      const hashedPassword = await bcrypt.hash(config.user.password, BCRYPT_ROUNDS);

      // 创建新用户
      let newUser = new User({
        username: config.user.username,
        password: hashedPassword,
        email: config.user.email,
      });

      await newUser.save();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * 创建默认管理员账户
   * 
   * 创建超级管理员和普通管理员账户（如果不存在）
   * 主要用于开发环境快速启动
   * 
   * ⚠️ 注意：生产环境不应该使用此方法，应该通过数据库迁移或种子脚本管理管理员
   * 
   * @returns {Promise<void>}
   */
  createAdmin = async (): Promise<void> => {
    try {
      // 定义要创建的管理员数据
      const adminDatas = [
        {
          username: config.superAdmin.username,
          password: config.superAdmin.password,
          isAdmin: true  // 超级管理员
        },
        {
          username: config.basicAdmin.username,
          password: config.basicAdmin.password,
          isAdmin: false  // 普通管理员
        }
      ];

      // 检查管理员是否已存在
      const admins = await Admin.find({
        username: {$in: [adminDatas[0].username, adminDatas[1].username]},
      });
      if (admins.length > 0) return;
      
      // 使用 Promise.all 并行创建所有管理员，确保所有异步操作完成
      await Promise.all(
        adminDatas.map(async (data:{username: string, password: string, isAdmin: boolean}) => {
          // 对密码进行哈希处理
          const hashedPassword = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

          // 创建管理员实例
          let admin = new Admin({
            username: data.username,
            password: hashedPassword,
            isAdmin: data.isAdmin
          });

          // 保存到数据库
          await admin.save();
        })
      );
    
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
