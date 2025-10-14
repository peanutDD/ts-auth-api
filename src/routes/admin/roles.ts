/*
 * @Author: peanut
 * @Date: 2021-04-17 23:54:15
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 00:13:19
 * @Description: file content
 */
import express, { Router } from "express";
import permit from "../../middlewares/admin/permission.middleware";
import * as rolesController from "../../controllers/admin/roles";
import checkAdminAuthMiddleware from "../../middlewares/admin/check-auth.middleware";

const router: Router = express.Router();

router
  .get(
    "/",
    checkAdminAuthMiddleware,
    permit("admin", "basic"),
    rolesController.index
  )
  .post(
    "/",
    checkAdminAuthMiddleware,
    permit("admin", "basic"),
    rolesController.addRole
  );

router.put("/:id", checkAdminAuthMiddleware, rolesController.updateRole);

export default router;
