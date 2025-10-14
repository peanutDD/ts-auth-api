/*
 * @Author: peanut
 * @Date: 2021-04-16 23:19:49
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 03:01:05
 * @Description: file content
 */
import { Request, Response } from "express";

import { InputError, validateInput } from "../../utils/admin/validator";
import HttpException from "../../exceptions/HttpException";
import StatusCodes from "http-status-codes";

import Admin from "../../models/Admin";

import bcrypt from "bcryptjs";
import { wrapAsync } from "../../helpers/wrap-async";
import { throwAdminNotFoundError, throwRoleNotFoundError } from "../../utils/throwError";
import Role from "../../models/Roles";

const { UNPROCESSABLE_ENTITY } = StatusCodes;

const throwValidateError = (errors: InputError) => {
  throw new HttpException(UNPROCESSABLE_ENTITY, "Admin input error", errors);
};

/**
 * Login adminUser
 *
 * @Method POST
 * @URL /api/admin/users/login
 *
 */
export const postLogin = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    const { errors, valid } = validateInput(username, password);

    if (!valid) {
      return throwValidateError(errors);
    }

    const admin = await Admin.findOne({ username });

    if (!admin) {
      errors.general = "Admin not found";
      return throwValidateError(errors);
    }

    const match = await bcrypt.compare(password, admin.password);

    if (!match) {
      errors.general = "Wrong credentials of password";
      return throwValidateError(errors);
    }

    const token = admin.generateToken();

    res.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        token,
      },
    });
  }
);

/**
 * Admin List
 *
 * @Method GET
 * @URL /api/admin/users
 *
 */
export const index = wrapAsync(
  async (_req: Request, res: Response): Promise<void> => {
    const admins = await Admin.find();

    res.json({
      success: true,
      data: {
        admins,
      },
    });
  }
);

/**
 * Add Admin
 *
 * @Method POST
 * @URL /api/admin/users
 *
 */
export const addAdmin = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, isAdmin, role } = req.body;

    const { errors, valid } = validateInput(username, password);

    if (!valid) {
      return throwValidateError(errors);
    }

    // const admin = await Admin.findOne({ username });

    // todo unique为 true 可以保证在添加管理员时用户的唯一性，在modes 数据库层面设置了 ，这里就可以不用再做一次验证了，所以将其注释掉
    // if (admin) {
    //   errors.username = "Username is taken";
    //   return throwValidateError(errors);
    // }
    // todo unique为 true 可以保证在添加管理员时用户的唯一性，在modes 数据库层面设置了 ，这里就可以不用再做一次验证了，所以将其注释掉

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      username,
      password: hashedPassword,
      isAdmin,
      role
    });

    const resAdmin = await newAdmin.save();

    res.json({
      success: true,
      data: {
        admin: resAdmin,
        message: "created successfully",
      },
    });
  }
);

/**
 * update single admin
 *
 * @Method PUT
 * @URL /api/admin/users/:id
 *
 */
export const updateAdmin = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { username, password, isAdmin, role } = req.body;

    const { errors, valid } = validateInput(username, password);

    if (!valid) {
      return throwValidateError(errors);
    }

    const { id } = req.params;

    const admin = await Admin.findById(id);

    if (admin) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const resAdmin = await Admin.findByIdAndUpdate(
        id,
        { username: username, password: hashedPassword, isAdmin: isAdmin, role: role },
        { new: true }
      );

      res.json({
        success: true,
        data: { message: "updated successfully", admin: resAdmin },
      });
    } else {
      throwAdminNotFoundError();
    }
  }
);

/**
 * Add role for admin
 *
 * @Method POST
 * @URL /api/admin/users/:id/role/:roleId
 *
 */
 export const role = wrapAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { id, roleId } = req.params;

    const admin = await Admin.findById(id);

    if (!admin) {
      throwAdminNotFoundError();
    }

    const role = await Role.findById(roleId);

    if (!role) {
      throwRoleNotFoundError();
    }

    if (admin && role) {
      admin.role = roleId;

      await admin.save();

      res.json({
        success: true,
        data: {
          admin
        }
      });
    }
  }
);
