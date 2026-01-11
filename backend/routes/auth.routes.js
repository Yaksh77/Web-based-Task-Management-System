import express from "express";
import { login, register } from "../controllers/auth.controller.js";
import {
  loginUserValidation,
  registerUserValidation,
} from "../middleware/validations.middleware.js";
const authRouter = express.Router();

authRouter.post("/register", registerUserValidation(), register);
authRouter.post("/login", loginUserValidation(), login);

export default authRouter;
