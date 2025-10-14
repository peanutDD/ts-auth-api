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
import jwt from "jsonwebtoken";
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

const adminSchema: Schema = new Schema(
  {
    username: { type: String, unique: true, required: true }, // todo unique为 true 可以保证 在添加管理员时 用户的唯一性，
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true },
    role: { type: Schema.Types.ObjectId, ref: "Role" },
  },
  { timestamps: true }
);

adminSchema.methods.generateToken = function (): string {
  const _this = this as IAdminDocument;
  const payload: AdminJwtPayload = { id: _this.id, username: _this.username };
  return jwt.sign(payload, config.auth.adminSecretKey, {
    expiresIn: "5d",
  });
};

// userSchema.set("toJSON", {
//   transform: function(_doc, ret) {
//     delete ret["password"];
//     return ret;
//   }
// });

// todo unique为 true 可以保证 在添加管理员时 用户的唯一性，
adminSchema.plugin(uniqueValidator);

const Admin: Model<IAdminDocument> = model<IAdminDocument>(
  "Admin",
  adminSchema
);

export default Admin;
