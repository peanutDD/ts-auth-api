/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 19:49:40
 * @Description: file content
 */
import { IAdminDocument } from "../models/Admin";
import { IUserDocument } from "../models/User";

declare global {
  namespace Express {
    export interface Request {
      currentUser?: IUserDocument;
      currentAdmin?: IAdminDocument;
    }
  }
}
