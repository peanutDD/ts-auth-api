/*
 * @Author: peanut
 * @Date: 2021-04-13 14:00:01
 * @LastEditors: peanut
 * @LastEditTime: 2021-04-17 13:45:41
 * @Description: file content
 */
import express, { Router } from "express";
import usersRouter from "./users";
import postsRouter from "./posts";

const router: Router = express.Router();

router.use("/users", usersRouter);
router.use("/posts", postsRouter);

export default router;
