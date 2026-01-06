import express from 'express';
import { login, register } from '../controllers/auth.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';
import { addTask } from '../controllers/user.controller.js';
const authRouter = express.Router();

authRouter.post('/register', register)
authRouter.post('/login', login);

export default authRouter;