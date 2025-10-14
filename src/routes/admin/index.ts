/*
 * @Author: peanut
 * @Date: 2021-04-17 13:44:11
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 23:56:26
 * @Description: file content
 */
import express, { Router } from "express";
import usersRouter from "./users";
import rolesRouter from './roles'

const router: Router = express.Router();

router.use("/users", usersRouter);
router.use("/roles", rolesRouter);

export default router;