import express from 'express';
import { addTask, deleteUser,   getMyTasks,  getProjectTasks,  getUserProjects,  updateTask,  updateUserRole } from '../controllers/user.controller.js';
import { isAdmin, verifyToken } from '../middleware/auth.middleware.js';

const userRouter = express.Router();

userRouter.post('/add-task',verifyToken, addTask);
userRouter.patch('/update-role',verifyToken,isAdmin, updateUserRole);
userRouter.delete('/delete-user/:userId',verifyToken,isAdmin, deleteUser);
userRouter.get('/user-projects',verifyToken, getUserProjects);
userRouter.get('/get-my-tasks',verifyToken, getMyTasks);
userRouter.get('/get-project-tasks/:projectId',verifyToken, getProjectTasks);
userRouter.put('/update-task/:taskId',verifyToken, updateTask);
// userRouter.get('/get-users',verifyToken, getAllUsers);

export default userRouter;