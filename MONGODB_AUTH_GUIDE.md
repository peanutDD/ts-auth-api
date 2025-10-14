# MongoDB 认证配置指南

本指南旨在帮助您了解和解决在连接MongoDB时遇到的认证问题，特别是针对 `com.mongodb.MongoSecurityException: Authentication failed` 错误。

## 当前状态诊断

根据测试结果，我们发现：

1. **无认证连接**：应用程序能够成功连接到MongoDB，无需提供任何认证信息
2. **带认证连接**：所有使用用户名和密码的连接尝试均失败，错误信息为 `Authentication failed`

这表明您的MongoDB服务器当前**未启用身份验证**。

## 开发环境配置

对于开发环境，当前的无认证连接配置已经能够正常工作。应用程序会：

1. 首先尝试无认证连接（大多数开发环境适用）
2. 如无认证连接失败，才会尝试使用配置文件中的认证信息

## 生产环境配置

对于生产环境，强烈建议启用MongoDB认证以提高安全性。以下是配置步骤：

### 步骤1：启用MongoDB认证

1. 停止MongoDB服务
2. 修改MongoDB配置文件（通常是 `mongod.conf`）：
   ```yaml
   security:
     authorization: enabled
   ```
3. 重启MongoDB服务

### 步骤2：创建管理员用户

连接到MongoDB并创建具有管理员权限的用户：

```bash
# 连接到MongoDB
mongo

# 切换到admin数据库
use admin

# 创建管理员用户
db.createUser({
  user: "peanut",
  pwd: "12345678",  # 使用您在.env文件中配置的密码
  roles: [ { role: "root", db: "admin" } ]
})
```

### 步骤3：为应用数据库创建用户

为您的应用数据库创建具有适当权限的用户：

```bash
# 切换到应用数据库
use tsexpress

# 创建应用用户
db.createUser({
  user: "peanut",
  pwd: "12345678",  # 使用您在.env文件中配置的密码
  roles: [ { role: "dbOwner", db: "tsexpress" } ]
})
```

## 应用程序配置

您的应用程序已经配置了灵活的连接策略：

1. 在 `src/app.ts` 中，应用程序会先尝试无认证连接
2. 如果无认证连接失败，会尝试使用 `authSource=admin` 的认证方式
3. 如果上述方式都失败，会提供详细的错误信息帮助诊断问题

## 常见问题排查

如果您遇到MongoDB认证问题，请检查以下几点：

1. **MongoDB服务是否正在运行**：使用 `mongod` 命令或服务管理器检查
2. **认证是否已启用**：确认MongoDB配置文件中的 `authorization` 设置
3. **用户是否存在**：使用 `mongo` shell 连接并验证用户是否存在于正确的数据库中
4. **密码是否正确**：确保 `.env` 文件中的密码与MongoDB中设置的密码匹配
5. **认证数据库是否正确**：默认情况下，管理员用户应在 `admin` 数据库中创建

## 测试连接

您可以使用我们创建的测试脚本来验证MongoDB连接配置：

```bash
npx ts-node src/test-mongodb-auth.ts
```

此脚本会测试多种连接方式并提供详细的诊断信息。

## 安全性建议

1. 在生产环境中始终启用MongoDB认证
2. 为不同的应用程序使用不同的数据库用户
3. 为用户分配最小必要的权限（遵循最小权限原则）
4. 定期更新密码并使用强密码策略
5. 考虑使用MongoDB的其他安全功能，如TLS/SSL加密连接