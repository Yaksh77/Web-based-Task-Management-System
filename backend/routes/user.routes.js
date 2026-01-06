import express from 'express';
import { addTask } from '../controllers/user.controller.js';

const userRouter = express.Router();

userRouter.post('/add-task', addTask);

export default userRouter;