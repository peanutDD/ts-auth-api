import express, { Router } from 'express';
import * as usersController from "../controllers/users";
import { authLimiter } from "../middlewares/rate-limit.middleware";
// import checkAuthMiddleware from "../middlewares/check-auth.middleware";

const router: Router = express.Router();

/**
 * 用户注册路由
 * 应用认证限流中间件，防止暴力破解
 */
router.post("/register", authLimiter, usersController.postRegister);

/**
 * 用户登录路由
 * 应用认证限流中间件，防止暴力破解
 */
router.post("/login", authLimiter, usersController.postLogin);

export default router;
