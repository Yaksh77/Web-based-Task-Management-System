import { and, count, eq, inArray, not } from "drizzle-orm";
import { db } from "../config/db.js";
import { activityLogs, projects, projectTaskMapping, projectUserMapping, tasks, users, userTaskMapping } from "../models/schema.js";
import { validationResult } from "express-validator";

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
    res.status(201).json({
      message: "Project created successfully",
      project: newProject[0],
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 1;
    const offset = (page - 1) * limit;

    const [allProjects, totalCountResult] = await Promise.all([
      db.select()
        .from(projects)
        .limit(limit)
        .offset(offset),
      db.select({ value: count() }).from(projects)
    ]);

    const totalProjects = totalCountResult[0].value;
    const totalPages = Math.ceil(totalProjects / limit);

    res.status(200).json({ 
      projects: allProjects,
      pagination: {
        totalProjects,
        currentPage: page,
        totalPages,
        limit
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
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
    console.log(result);
    res.status(200).json({ message: "User assigned to project successfully" });
  } catch (error) {
    console.log(`Error ocurred while assigning user to project : ${error}`);
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
    res.status(200).json({ project: project[0] });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project details",
      error: error.message,
    });
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
    res.status(200).json({ message: "Project updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating project", error: error.message });
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
       
        await tx.delete(userTaskMapping).where(inArray(userTaskMapping.taskId, taskIds));
        await tx.delete(projectTaskMapping).where(inArray(projectTaskMapping.taskId, taskIds));
        await tx.delete(activityLogs).where(inArray(activityLogs.taskId, taskIds));

        await tx.delete(tasks).where(inArray(tasks.id, taskIds));
      }

      await tx.delete(projects).where(eq(projects.id, Number(projectId)));
    });

    res.status(200).json({ message: "Project and all associated tasks deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Error deleting project", error: error.message });
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

    res.status(200).json({ userMappings, usersInfo });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project users",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100; 
  const offset = (page - 1) * limit;

  try {
    const [allUsers, totalCountResult] = await db.transaction(async (tx) => {
      const usersData = await tx
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

      const countRes = await tx.select({ value: count() }).from(users);
      return [usersData, countRes];
    });

    const totalUsers = totalCountResult[0].value;

    res.status(200).json({
      users: allUsers,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        limit,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
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

    res.status(200).json({ 
      message: "User removed from project and their task assignments cleared." 
    });
  } catch (error) {
    res.status(500).json({
      message: "Error removing user and tasks",
      error: error.message,
    });
  }
};
