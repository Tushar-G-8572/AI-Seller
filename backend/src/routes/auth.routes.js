import { Router } from "express";
import { handleGetMeController, handleLoginController, handleLogoutController, handleRegisterController } from "../controller/auth.controller.js";
import { registerValidator,loginValidation } from "../validators/auth.validate.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const authRouter = Router();

authRouter.post('/register',registerValidator,handleRegisterController);

authRouter.post('/login',loginValidation,handleLoginController);

authRouter.post('/logout',authMiddleware,handleLogoutController);

authRouter.get('/get-me',authMiddleware,handleGetMeController);

export default authRouter;