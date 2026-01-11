import express from "express";
import {
  addTask,
  deleteTask,
  deleteUser,
  getMyTasks,
  getProjectMembers,
  getProjectTasks,
  getUserProjects,
  updateTask,
  updateUserRole,
} from "../controllers/user.controller.js";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import {
  addTaskValidation,
  updateTaskValidation,
} from "../middleware/validations.middleware.js";

const userRouter = express.Router();

userRouter.post("/add-task", verifyToken, addTaskValidation(), addTask);
userRouter.put(
  "/update-task/:taskId",
  verifyToken,
  updateTaskValidation(),
  updateTask
);
userRouter.patch("/update-role", verifyToken, isAdmin, updateUserRole);
userRouter.delete("/delete-user/:userId", verifyToken, isAdmin, deleteUser);
userRouter.get("/user-projects", verifyToken, getUserProjects);
userRouter.get("/get-my-tasks", verifyToken, getMyTasks);
userRouter.get("/get-project-tasks/:projectId", verifyToken, getProjectTasks);
userRouter.get("/project-members/:projectId", verifyToken, getProjectMembers);
userRouter.delete("/delete-task/:taskId", verifyToken, deleteTask);

export default userRouter;
