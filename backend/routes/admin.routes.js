import express from "express";
import { isAdmin, verifyToken } from "../middleware/auth.middleware.js";
import {
  assignUsersToProject,
  createProject,
  deleteProject,
  getAllProjects,
  getAllUsers,
  getProjectDetails,
  getProjectUsers,
  removeUserFromProject,
  updateProject,
} from "../controllers/admin.controller.js";
import { createAndUpdateProjectValidation } from "../middleware/validations.middleware.js";

const adminRouter = express.Router();

adminRouter.post(
  "/create-project",
  verifyToken,
  isAdmin,
  createAndUpdateProjectValidation(),
  createProject
);
adminRouter.post("/assign-user", verifyToken, isAdmin, assignUsersToProject);
adminRouter.get("/get-all-projects", verifyToken, isAdmin, getAllProjects);
adminRouter.get(
  "/get-project-details/:projectId",
  verifyToken,
  isAdmin,
  getProjectDetails
);
adminRouter.get(
  "/get-project-users/:projectId",
  verifyToken,
  isAdmin,
  getProjectUsers
);
adminRouter.patch(
  "/update-project/:projectId",
  verifyToken,
  isAdmin,
  createAndUpdateProjectValidation(),
  updateProject
);
adminRouter.delete(
  "/delete-project/:projectId",
  verifyToken,
  isAdmin,
  deleteProject
);
adminRouter.delete(
  "/remove-user/:projectId/:userId",
  verifyToken,
  isAdmin,
  removeUserFromProject
);
adminRouter.get("/get-all-users", verifyToken, getAllUsers);

export default adminRouter;
