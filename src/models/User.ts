/**
 * 用户数据模型
 * 
 * 定义用户的数据结构和相关方法
 * 使用 Mongoose Schema 定义用户集合的结构
 * 
 * @file src/models/User.ts
 * @author peanut
 * @date 2021-04-13
 */

import jwt, { SignOptions } from "jsonwebtoken";
import { Schema, model, Model, Document } from "mongoose";
import { JwtPayload } from "../types/Jwt";
import config from "../config/config";

/**
 * 用户文档接口
 * 扩展了 Mongoose Document，定义了用户的数据结构和方法
 */
export interface IUserDocument extends Document {
  username: string;      // 用户名
  email: string;        // 邮箱地址
  password: string;      // 密码（已哈希）
  generateToken: () => string;  // 生成 JWT token 的方法
}

/**
 * 用户 Schema 定义
 * 
 * 字段说明：
 * - username: 用户名（字符串类型，唯一索引，用于快速查询）
 * - email: 邮箱地址（字符串类型，唯一索引，用于快速查询）
 * - password: 密码（字符串类型，存储哈希值）
 * 
 * 选项：
 * - timestamps: true - 自动添加 createdAt 和 updatedAt 时间戳
 * 
 * 索引：
 * - username: 唯一索引，提高查询性能
 * - email: 唯一索引，提高查询性能
 */
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false  // 默认查询时不返回密码字段
    }
  },
  { timestamps: true }
);

/**
 * 生成 JWT Token 的实例方法
 * 
 * 使用用户的 ID 和用户名生成 JWT token
 * Token 有效期为 5 天
 * 
 * @returns {string} JWT token 字符串
 * 
 * @example
 * const user = await User.findOne({ username: "testuser" });
 * const token = user.generateToken();
 */
userSchema.methods.generateToken = function(): string {
  const _this = this as IUserDocument;
  const payload: JwtPayload = { id: _this.id, username: _this.username };
  const expiresIn = typeof config.auth.expiresIn === "string" 
    ? config.auth.expiresIn 
    : "5d";  // Token 有效期：从配置读取，默认5天
  // 使用类型断言，因为 jsonwebtoken 的 expiresIn 接受 string 或 number
  return jwt.sign(payload, config.auth.secretKey, {
    expiresIn: expiresIn as any
  } as SignOptions);
};

/**
 * 配置 JSON 序列化
 * 
 * 在将用户对象转换为 JSON 时自动移除密码字段
 * 防止密码字段在 API 响应中泄露
 */
userSchema.set("toJSON", {
  transform: function(_doc, ret) {
    delete ret["password"];
    return ret;
  }
});

/**
 * 创建并导出 User 模型
 * 模型名称 "User" 对应 MongoDB 集合名称（Mongoose 会自动转换为复数形式 "users"）
 */
const User: Model<IUserDocument> = model<IUserDocument>("User", userSchema);

export default User;
