import express, { Express, Request, Response } from "express";

// database
import mongoose from "mongoose";

// error handler
import errorMiddleware from "./middlewares/error.middleware";

// config
import "dotenv/config";
import config from "./config/config";

// middleware
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import routes from "./routes";

// logger
import { Logger, ILogger } from "./utils/logger";
import notFoundError from "./middlewares/notFoundHandler.middleware";

// model
import User from "./models/User";
import Admin from "./models/Admin";

import bcrypt from "bcryptjs";

export class Application {
  app: Express;
  config = config;
  logger: ILogger;

  constructor() {
    this.logger = new Logger(__filename);
    this.app = express();
    this.app.use(require("express-status-monitor")());
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(
      morgan("dev", {
        skip: () => config.environment === "test",
      })
    );

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.get("/", (_req: Request, res: Response) => {
      res.json({
        message: "hello world",
      });
    });

    this.app.use("/api", routes);

    this.app.use(notFoundError);

    this.app.use(errorMiddleware);
  }

  setupDbAndServer = async () => {
    await this.setupDb();
    await this.startServer();
    await this.createUser();
    await this.createAdmin();
  };

  setupDb = async () => {
    // Mongoose 6+ 不再需要这些配置选项
    try {
      // Handle potential undefined values
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

  createUser = async (): Promise<void> => {
    try {
      const user = await User.findOne({ username: config.user.username });
      if (user) return;

      const hashedPassword = await bcrypt.hash(config.user.password, 10);

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

  createAdmin = async (): Promise<void> => {
    try {

      const adminDatas = [
        {
          username: config.superAdmin.username,
          password: config.superAdmin.password,
          isAdmin: true
        },
        {
          username: config.basicAdmin.username,
          password: config.basicAdmin.password,
          isAdmin: false
        }
      ];

      const admins = await Admin.find({
        username: {$in: [adminDatas[0].username, adminDatas[1].username]},
      });
      if (admins.length > 0) return;
      
      // 使用 Promise.all 确保所有异步操作完成
      await Promise.all(
        adminDatas.map(async (data:{username: string, password: string, isAdmin: boolean}) => {
          const hashedPassword = await bcrypt.hash(data.password, 10)

          let admin = new Admin({
            username: data.username,
            password: hashedPassword,
            isAdmin: data.isAdmin
          })

          await admin.save()
        })
      )
    
    } catch (error) {
      return Promise.reject(error);
    }
  };
}
