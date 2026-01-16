import { and, count, eq, ilike, inArray, not, or } from "drizzle-orm";
import { db } from "../config/db.js";
import {
  activityLogs,
  projects,
  projectTaskMapping,
  projectUserMapping,
  tasks,
  users,
  userTaskMapping,
} from "../models/schema.js";
import { validationResult } from "express-validator";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../utils/responseHandler.js";

export const createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description } = req.body;
  try {
    const newProject = await db.insert(projects).values({
      title,
      description,
      createdBy: req.user.id,
    });
    return sendSuccessResponse(
      res,
      201,
      "Project created successfully",
      newProject
    );
  } catch (error) {
    return sendErrorResponse(res, 500, "Error creating project", error.message);
  }
};

export const createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const newUser = await db.insert(users).values({
      name,
      email,
      password,
      role,
    });
    return sendSuccessResponse(res, 201, "User created successfully", newUser);
  } catch (error) {
    return sendErrorResponse(res, 500, "Error creating user", error.message);
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const offset = (page - 1) * limit;

    const [allProjects, totalCountResult] = await Promise.all([
      db.select().from(projects).limit(limit).offset(offset),
      db.select({ value: count() }).from(projects),
    ]);

    const totalProjects = totalCountResult[0].value;
    const totalPages = Math.ceil(totalProjects / limit);

    // res.status(200).json({
    //   projects: allProjects,
    //   pagination: {
    //     totalProjects,
    //     currentPage: page,
    //     totalPages,
    //     limit,
    //   },
    // });

    return sendSuccessResponse(
      res,
      200,
      "Projects fetched successfully",
      { projects: allProjects },
      {
        totalProjects,
        currentPage: page,
        totalPages,
        limit,
      }
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error fetching projects",
      error.message
    );
  }
};

export const assignUsersToProject = async (req, res) => {
  const { projectId, userId } = req.body;
  try {
    const exisitngUserAssignment = await db
      .select()
      .from(projectUserMapping)
      .where(
        and(
          eq(projectUserMapping.projectId, Number(projectId)),
          eq(projectUserMapping.userId, Number(userId))
        )
      );

    if (exisitngUserAssignment.length > 0) {
      return res
        .status(400)
        .json({ message: "User is already assigned to this project" });
    }

    const result = await db.insert(projectUserMapping).values({
      projectId: Number(projectId),
      userId: Number(userId),
    });

    return sendSuccessResponse(
      res,
      200,
      "User assigned to project successfully",
      result
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error assigning user to project",
      error.message
    );
  }
};

export const getProjectDetails = async (req, res) => {
  const { projectId } = req.params;
  try {
    const project = await db
      .select()
      .from(projects)
      .where(eq(projects.id, Number(projectId)));
    if (project.length === 0) {
      return res.status(404).json({ message: "Project not found" });
    }
    return sendSuccessResponse(
      res,
      200,
      "Project details fetched successfully",
      project[0]
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error fetching project details",
      error.message
    );
  }
};

export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { title, description } = req.body;
  try {
    const result = await db
      .update(projects)
      .set({ title, description })
      .where(eq(projects.id, Number(projectId)));
    return sendSuccessResponse(
      res,
      200,
      "Project updated successfully",
      result
    );
  } catch (error) {
    return sendErrorResponse(res, 500, "Error updating project", error.message);
  }
};

export const deleteProject = async (req, res) => {
  const { projectId } = req.params;

  try {
    await db.transaction(async (tx) => {
      const associatedTasks = await tx
        .select({ taskId: projectTaskMapping.taskId })
        .from(projectTaskMapping)
        .where(eq(projectTaskMapping.projectId, Number(projectId)));

      const taskIds = associatedTasks.map((t) => t.taskId);

      if (taskIds.length > 0) {
        await tx
          .delete(userTaskMapping)
          .where(inArray(userTaskMapping.taskId, taskIds));
        await tx
          .delete(projectTaskMapping)
          .where(inArray(projectTaskMapping.taskId, taskIds));
        await tx
          .delete(activityLogs)
          .where(inArray(activityLogs.taskId, taskIds));

        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      await tx.delete(projects).where(eq(projects.id, Number(projectId)));
    });

    return sendSuccessResponse(
      res,
      200,
      "Project and associated data deleted successfully"
    );
  } catch (error) {
    console.error("Delete Error:", error);
    return sendErrorResponse(res, 500, "Error deleting project", error.message);
  }
};

export const getProjectUsers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const userMappings = await db
      .select({
        userId: projectUserMapping.userId,
        projectId: projectUserMapping.projectId,
      })
      .from(projectUserMapping)
      .where(eq(projectUserMapping.projectId, Number(projectId)));

    // Get detailed user info
    const userIds = userMappings.map((mapping) => mapping.userId);
    const usersInfo = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(inArray(users.id, userIds));

    // res.status(200).json({ userMappings, usersInfo });

    return sendSuccessResponse(res, 200, "Project users fetched successfully", {
      userMappings,
      usersInfo,
    });
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error fetching project users",
      error.message
    );
  }
};

export const getAllUsers = async (req, res) => {
  const search = req.query.search || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    let whereClause = [];
    if (search) {
      whereClause.push(
        or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      );
    }

    const usersDataQuery = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })
      .from(users)
      .limit(limit)
      .offset(offset);

    const countQuery = db.select({ value: count() }).from(users);

    if (whereClause.length > 0) {
      usersDataQuery.where(and(...whereClause));
      countQuery.where(and(...whereClause));
    }

    const [allUsers, totalCountResult] = await Promise.all([
      usersDataQuery,
      countQuery,
    ]);

    const totalUsers = totalCountResult[0].value;
    const totalPages = Math.ceil(totalUsers / limit);

    // res.status(200).json({
    //   users: allUsers,
    //   pagination: {
    //     totalUsers,
    //     currentPage: page,
    //     totalPages,
    //     limit,
    //   },
    // });

    return sendSuccessResponse(
      res,
      200,
      "Users fetched successfully",
      { users: allUsers },
      { totalUsers, currentPage: page, totalPages, limit }
    );
  } catch (error) {
    console.error("FULL ERROR DETAILS:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", details: error.message });
  }
};

export const removeUserFromProject = async (req, res) => {
  const { projectId, userId } = req.params;
  const pId = Number(projectId);
  const uId = Number(userId);

  try {
    await db.transaction(async (tx) => {
      await tx
        .delete(projectUserMapping)
        .where(
          and(
            eq(projectUserMapping.projectId, pId),
            eq(projectUserMapping.userId, uId)
          )
        );

      const projectTasks = await tx
        .select({ taskId: projectTaskMapping.taskId })
        .from(projectTaskMapping)
        .where(eq(projectTaskMapping.projectId, pId));

      const taskIds = projectTasks.map((t) => t.taskId);

      if (taskIds.length > 0) {
        await tx
          .delete(userTaskMapping)
          .where(
            and(
              eq(userTaskMapping.userId, uId),
              inArray(userTaskMapping.taskId, taskIds)
            )
          );
      }
    });

    return sendSuccessResponse(
      res,
      200,
      "User removed from project and associated tasks successfully"
    );
  } catch (error) {
    return sendErrorResponse(
      res,
      500,
      "Error removing user from project",
      error.message
    );
  }
};
