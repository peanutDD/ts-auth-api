/*
 * @Author: peanut
 * @Date: 2021-04-17 19:22:31
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 00:40:51
 * @Description: file content
 */
import { Response, NextFunction, Request } from "express";

import StatusCodes from "http-status-codes";
import HttpException from "../../exceptions/HttpException";

import jwt from "jsonwebtoken";
import { AdminJwtPayload } from "../../types/Jwt";

import Admin from "../../models/Admin";

import config from "../../config/config";

const { UNAUTHORIZED } = StatusCodes;

const checkAdminAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers["authorization"];

  if (authorizationHeader) {
    const token = authorizationHeader.split("Bearer ")[1];

    if (token) {
      try {
        const jwtData = jwt.verify(
          token,
          config.auth.secretKey
        ) as AdminJwtPayload;

        const admin = await Admin.findById(jwtData.id);

        if (admin) {
          req.currentAdmin = admin;
          return next();
        } else {
          return next(new HttpException(UNAUTHORIZED, "No such admin"));
        }
      } catch (error) {
        return next(new HttpException(UNAUTHORIZED, "Invalid/Expired token"));
      }
    }

    return next(
      new HttpException(
        UNAUTHORIZED,
        "Authorization token must be 'Bearer [token]"
      )
    );
  }

  next(
    new HttpException(UNAUTHORIZED, "Authorization header must be provided")
  );
};

export default checkAdminAuthMiddleware;
