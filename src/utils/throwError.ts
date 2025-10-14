/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 00:02:37
 * @Description: file content
 */
import HttpException from "../exceptions/HttpException";
import StatusCodes from "http-status-codes";


const { NOT_FOUND, UNAUTHORIZED } = StatusCodes

export const throwAdminNotFoundError = () => {
  throw new HttpException(NOT_FOUND, "Post not found");
};

export const throwRoleNotFoundError = () => {
  throw new HttpException(NOT_FOUND, "Role not found");
};

export const throwPostNotFoundError = () => {
  throw new HttpException(NOT_FOUND, "Post not found");
};

export const throwCommentNotFoundError = () => {
  throw new HttpException(NOT_FOUND, "Comment not found");
};

export const throwActionNotAllowedError = () => {
  throw new HttpException(UNAUTHORIZED, "Action not allowed");
};


