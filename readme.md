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

### 安装步骤

1. 克隆项目

```bash
git clone https://github.com/peanutDD/ts-auth-api.git
cd ts-auth-api-main
```

2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，设置数据库连接信息和 JWT 密钥
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
