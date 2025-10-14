/*
 * @Author: peanut
 * @Date: 2021-04-17 13:40:41
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-18 00:54:09
 * @Description: file content
 */
import express, { Router } from "express";
import checkAdminAuthMiddleware from "../../middlewares/admin/check-auth.middleware";
import permit from "../../middlewares/admin/permission.middleware";
import * as usersController from "../../controllers/admin/users";

const router: Router = express.Router();

router.post("/login", usersController.postLogin);
router
  .get("/", checkAdminAuthMiddleware, permit('admin', 'basic','common'), usersController.index)
  .post("/",checkAdminAuthMiddleware,permit('admin'), usersController.addAdmin);

router.put("/:id",checkAdminAuthMiddleware, permit(), usersController.updateAdmin);

router.post("/:id/role/:roleId", usersController.role);

export default router;
