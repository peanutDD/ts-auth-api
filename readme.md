# TypeScript 认证 API 项目

一个使用 TypeScript、Express 和 MongoDB 构建的 RESTful API 认证系统，包含用户认证、权限管理和博客功能。

## 功能特点

- **用户认证系统**：注册、登录、JWT 认证
- **权限管理**：基于角色的访问控制
- **博客功能**：文章创建、查询、评论
- **管理员功能**：用户管理、内容审核
- **错误处理**：统一的错误处理中间件
- **数据验证**：请求参数验证

## 技术栈

- **后端框架**：Express.js
- **编程语言**：TypeScript
- **数据库**：MongoDB
- **ODM**：Mongoose
- **认证**：JWT (JSON Web Tokens)
- **HTTP 状态码**：http-status-codes
- **环境变量**：dotenv

## 项目结构

```
/ts-auth-api-main
├── src/
│   ├── app.ts                 # Express 应用配置
│   ├── config/                # 配置文件
│   ├── controllers/           # 控制器
│   ├── db/                    # 数据库相关
│   ├── exceptions/            # 自定义异常
│   ├── middlewares/           # 中间件
│   ├── models/                # Mongoose 模型
│   ├── routes/                # 路由定义
│   ├── types/                 # TypeScript 类型定义
│   └── utils/                 # 工具函数
├── .env.example               # 环境变量示例
├── package.json               # 项目依赖
└── tsconfig.json              # TypeScript 配置
```

## 安装与设置

### 前置要求

- Node.js 14+
- MongoDB 数据库

### MongoDB 启动与配置

#### macOS 环境

如果使用 Homebrew 安装的 MongoDB：

```bash
# 启动 MongoDB 服务
brew services start mongodb-community

# 停止 MongoDB 服务
brew services stop mongodb-community

# 重启 MongoDB 服务
brew services restart mongodb-community
```

#### Windows 环境

如果使用 MongoDB Compass 或手动安装：

```bash
# 启动 MongoDB 服务（命令行）
net start MongoDB

# 停止 MongoDB 服务
net stop MongoDB
```

#### 使用 MongoDB Atlas（云服务）

1. 在 [MongoDB Atlas](https://www.mongodb.com/atlas) 创建账户并设置集群
2. 获取连接字符串
3. 在 `.env` 文件中设置 `MONGODB_URI`

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/peanutDD/ts-auth-api.git
cd ts-auth-api-main
```

2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置以下环境变量
```

在 `.env` 文件中需要配置的关键环境变量：

```
# MongoDB 连接字符串
# 本地开发环境示例：
MONGODB_URI=mongodb://localhost:27017/ts-auth-api

# 或使用 MongoDB Atlas 连接字符串：
# MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ts-auth-api?retryWrites=true&w=majority

# JWT 密钥（用于签名令牌）
JWT_SECRET=your-secret-key-here-please-change-in-production

# JWT 令牌过期时间（秒）
JWT_EXPIRES_IN=3600

# 服务器端口
PORT=6060
```

3. 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install
```

4. 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev
```

## API 文档

详细的 API 端点说明请查看 [API_DOCS.md](./API_DOCS.md)。

## 常见问题解决

- **请求体解析问题**：参考 [FIX_REQ_BODY_UNDEFINED.md](./FIX_REQ_BODY_UNDEFINED.md)
- **MongoDB 认证问题**：参考 [MONGODB_AUTH_GUIDE.md](./MONGODB_AUTH_GUIDE.md)
- **GitHub 部署问题**：参考 [GITHUB_DEPLOY_GUIDE.md](./GITHUB_DEPLOY_GUIDE.md)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
