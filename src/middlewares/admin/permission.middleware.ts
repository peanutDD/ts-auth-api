/*
 * @Author: peanut
 * @Date: 2021-04-17 19:25:58
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 00:52:42
 * @Description: file content
 */
import { Request, Response, NextFunction } from "express";
import StatusCodes from "http-status-codes";
import HttpException from "../../exceptions/HttpException";

const permit = (...roles: string[]) => {
  const allowedRole = (role: string) => roles.indexOf(role) > -1
  return (req: Request, _res: Response, next: NextFunction) => {
    console.log(allowedRole(req.currentAdmin!.role))
    if (req.currentAdmin && req.currentAdmin.isAdmin || allowedRole(req.currentAdmin!.role)) {
      next();
    } else {
      next(new HttpException(StatusCodes.FORBIDDEN, "Access Denied"));
    }
  };
};

export default permit;