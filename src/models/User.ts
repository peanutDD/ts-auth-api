/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 23:28:59
 * @Description: file content
 */
import jwt from "jsonwebtoken";
import { Schema, model, Model, Document } from "mongoose";
import { JwtPayload } from "../types/Jwt";
import config from "../config/config";

export interface IUserDocument extends Document {
  username: string;
  email: string;
  password: string;
  // _doc: IUserDocument;
  generateToken: () => string;
}

const userSchema: Schema = new Schema(
  {
    username: String,
    email: String,
    password: String
  },
  { timestamps: true }
);

userSchema.methods.generateToken = function(): string {
  const _this = this as IUserDocument
  const payload: JwtPayload = { id: _this.id, username: _this.username };
  return jwt.sign(payload, config.auth.secretKey, {
    expiresIn: "5d"
  });
};

// userSchema.set("toJSON", {
//   transform: function(_doc, ret) {
//     delete ret["password"];
//     return ret;
//   }
// });

const User: Model<IUserDocument> = model<IUserDocument>("User", userSchema);

export default User;
