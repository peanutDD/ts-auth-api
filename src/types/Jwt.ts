/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 18:40:27
 * @Description: file content
 */
import { IAdminDocument } from "../models/Admin";
import { IUserDocument } from "../models/User";

export interface JwtPayload {
  id: IUserDocument["_id"];
  username: IUserDocument["username"];
}

export interface AdminJwtPayload {
  id: IAdminDocument["_id"];
  username: IAdminDocument["username"];
}