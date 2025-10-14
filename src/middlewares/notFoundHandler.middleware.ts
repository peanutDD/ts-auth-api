import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import StatusCodes from "http-status-codes";

export default function notFoundError(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  const error: HttpException = new HttpException(StatusCodes.NOT_FOUND, "Router Not Found");
  next(error);
}
