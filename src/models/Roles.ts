/*
 * @Author: peanut
 * @Date: 2021-04-17 23:53:36
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 23:53:40
 * @Description: file content
 */
import { Schema, model, Model, Document } from "mongoose";
// @ts-ignore
import uniqueValidator from "mongoose-unique-validator";

export interface IRoleDocument extends Document {
  name: string;
}

const roleSchema: Schema = new Schema(
  {
    name: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Name must not be empty"]
    },
    nameCn: String
  },
  { timestamps: true }
);

roleSchema.plugin(uniqueValidator);

const Role: Model<IRoleDocument> = model<IRoleDocument>("Role", roleSchema);

export default Role;