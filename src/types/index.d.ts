// 扩展Express的Request接口，添加currentUser属性
import { Request } from 'express';
import { IUserDocument } from '../models/User';

declare module 'express' {
  export interface Request {
    currentUser?: IUserDocument;
  }
}