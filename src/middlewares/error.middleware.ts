import { Request, Response, NextFunction } from "express";
import HttpException from "../exceptions/HttpException";
import StatusCodes from "http-status-codes";
import config from "../config/config";
import { Logger, ILogger } from "../utils/logger";

const logger: ILogger = new Logger(__filename);

/**
 * Generic error response middleware for internal server errors.
 *
 * @param  {HttpException} error
 * @param  {Request} _request
 * @param  {Response} response
 * @param  {NextFunction} next
 */
const errorMiddleware = (
  error: HttpException | Error,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const isProduction = config.environment === "production";
  const status = (error instanceof HttpException ? error.status : undefined) || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = error.message || "Something went wrong";

  // 记录错误日志
  logger.error(`Error ${status}: ${message}`, {
    path: request.path,
    method: request.method,
    ip: request.ip,
    stack: error.stack,
    errors: error instanceof HttpException ? error.errors : undefined
  });

  // 定义错误响应接口
  interface ErrorResponse {
    success: false;
    message: string;
    errors?: Record<string, string>;
  }

  // 生产环境隐藏敏感错误信息
  const errorResponse: ErrorResponse = {
    success: false,
    message: isProduction && status === StatusCodes.INTERNAL_SERVER_ERROR 
      ? "Internal server error" 
      : message
  };

  // 只在开发环境或非 500 错误时返回详细错误信息
  if (!isProduction || status !== StatusCodes.INTERNAL_SERVER_ERROR) {
    if (error instanceof HttpException && error.errors) {
      errorResponse.errors = error.errors;
    }
  }

  response.status(status).json(errorResponse);

  next();
};

export default errorMiddleware;
