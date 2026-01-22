/*
 * @Author: peanut
 * @Date: 2021-04-16 23:19:32
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 14:15:13
 * @Description: file content
 */
/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-13 15:26:46
 * @Description: file content
 */
import jwt, { SignOptions } from "jsonwebtoken";
import { Schema, model, Model, Document } from "mongoose";
import { AdminJwtPayload } from "../types/Jwt";
import config from "../config/config";
import uniqueValidator from "mongoose-unique-validator";
import { IRoleDocument } from "./Roles";

// enum Role {
//   admin = "admin",
//   basic = "basic",
//   common = "common",
// }

export interface IAdminDocument extends Document {
  username: string;
  password: string;
  isAdmin: boolean;
  role: IRoleDocument["_id"];
  // _doc: IUserDocument;
  generateToken: () => string;
}

/**
 * 管理员 Schema 定义
 * 
 * 字段说明：
 * - username: 用户名（字符串类型，唯一索引，用于快速查询）
 * - password: 密码（字符串类型，存储哈希值，默认查询时不返回）
 * - isAdmin: 是否为超级管理员（布尔类型）
 * - role: 角色ID（ObjectId，引用 Role 模型）
 * 
 * 选项：
 * - timestamps: true - 自动添加 createdAt 和 updatedAt 时间戳
 * 
 * 索引：
 * - username: 唯一索引，提高查询性能，保证用户名唯一性
 */
const adminSchema: Schema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      index: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      select: false  // 默认查询时不返回密码字段
    },
    isAdmin: {
      type: Boolean,
      required: true
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role"
    },
  },
  { timestamps: true }
);

/**
 * 生成 JWT Token 的实例方法
 * 
 * 使用管理员的 ID 和用户名生成 JWT token
 * Token 有效期为从配置读取，默认5天
 * 
 * @returns {string} JWT token 字符串
 */
adminSchema.methods.generateToken = function (): string {
  const _this = this as IAdminDocument;
  const payload: AdminJwtPayload = { id: _this.id, username: _this.username };
  const expiresIn = typeof config.auth.expiresIn === "string" 
    ? config.auth.expiresIn 
    : "5d";  // Token 有效期：从配置读取，默认5天
  // 使用类型断言，因为 jsonwebtoken 的 expiresIn 接受 string 或 number
  return jwt.sign(payload, config.auth.adminSecretKey, {
    expiresIn: expiresIn as any
  } as SignOptions);
};

/**
 * 配置 JSON 序列化
 * 
 * 在将管理员对象转换为 JSON 时自动移除密码字段
 * 防止密码字段在 API 响应中泄露
 */
adminSchema.set("toJSON", {
  transform: function(_doc, ret) {
    delete ret["password"];
    return ret;
  }
});

// todo unique为 true 可以保证 在添加管理员时 用户的唯一性，
adminSchema.plugin(uniqueValidator);

const Admin: Model<IAdminDocument> = model<IAdminDocument>(
  "Admin",
  adminSchema
);

export default Admin;
