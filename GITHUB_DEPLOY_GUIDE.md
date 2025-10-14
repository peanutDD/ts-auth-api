# GitHub 项目发布指南

## 问题分析

经过检查，您的项目已经正确初始化git仓库，配置了远程仓库和用户信息，但可能存在**认证问题**导致无法推送到GitHub。

### 已确认的配置：
- ✅ Git仓库已初始化，处于main分支
- ✅ 远程仓库已配置：`https://github.com/peanutDD/ts-auth-api.git`
- ✅ 用户信息已设置（name: peanut, email: www.smoking.sexy@gmail.com）
- ✅ 使用osxkeychain作为凭证助手

## 解决方案

### 方法一：使用个人访问令牌(PAT)进行HTTPS认证（推荐）

GitHub不再支持密码认证，需要使用个人访问令牌：

1. **生成个人访问令牌**：
   - 登录GitHub账户
   - 进入 Settings > Developer settings > Personal access tokens > Tokens (classic)
   - 点击 "Generate new token" > "Generate new token (classic)"
   - 设置过期时间，选择权限（至少需要 `repo` 权限）
   - 生成并**保存**令牌（只显示一次）

2. **在终端中使用令牌**：

```bash
# 方法A：直接在命令中提供令牌
git push https://<YOUR_TOKEN>@github.com/peanutDD/ts-auth-api.git main

# 方法B：使用git credential-osxkeychain更新凭证（推荐）
# 首先删除旧凭证
git credential-osxkeychain erase
host=github.com
protocol=https

# 然后重新推送，系统会提示输入用户名和密码
# 用户名输入您的GitHub用户名
# 密码输入您的个人访问令牌
git push origin main
```

### 方法二：切换到SSH认证方式

SSH认证更加安全且不需要频繁输入凭证：

1. **检查是否已存在SSH密钥**：

```bash
ls -al ~/.ssh
```

2. **生成新的SSH密钥**（如果不存在）：

```bash
ssh-keygen -t ed25519 -C "www.smoking.sexy@gmail.com"
# 按Enter接受默认位置和密码
```

3. **将SSH密钥添加到SSH代理**：

```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

4. **将公钥添加到GitHub**：

```bash
# 复制公钥内容
pbcopy < ~/.ssh/id_ed25519.pub

# 登录GitHub，进入 Settings > SSH and GPG keys > New SSH key
# 粘贴公钥内容并保存
```

5. **更新远程仓库URL为SSH格式**：

```bash
git remote set-url origin git@github.com:peanutDD/ts-auth-api.git
```

6. **测试SSH连接**：

```bash
ssh -T git@github.com
```

7. **推送代码**：

```bash
git push origin main
```

## 常见问题排查

### 1. 远程仓库不存在

如果GitHub上还没有创建仓库：
1. 登录GitHub，创建同名仓库（ts-auth-api）
2. 不要勾选"Initialize this repository with a README"
3. 按照GitHub提供的命令初始化推送

### 2. 权限问题

确保您有目标仓库的写入权限。如果是fork的仓库，需要先fork再克隆。

### 3. 网络问题

如果遇到连接超时，检查网络代理设置：

```bash
# 设置代理（如果需要）
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080

# 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 4. 大文件问题

如果有大文件导致推送失败，考虑使用Git LFS或增加缓冲区大小：

```bash
git config --global http.postBuffer 524288000
```

## 验证发布状态

成功推送后，可以通过以下命令验证：

```bash
git ls-remote origin
```

或者直接在GitHub网页上检查仓库内容。

## 发布到GitHub的完整工作流程

```bash
# 1. 确保所有更改已提交
git add .
git commit -m "完善项目功能"

# 2. 推送更改（使用上述任一认证方法）
git push origin main

# 3. 如果需要创建新版本标签
git tag v1.0.0
git push origin v1.0.0
```

按照上述步骤操作后，您应该能够成功将项目发布到GitHub。如果仍然遇到问题，请检查具体的错误信息并参考GitHub官方文档。