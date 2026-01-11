import { and, eq, inArray, not } from "drizzle-orm";
import { db } from "../config/db.js";
import { projects, projectUserMapping, users } from "../models/schema.js";
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
    const allProjects = await db.select().from(projects);
    res.status(200).json({ projects: allProjects });
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
    await db.delete(projects).where(eq(projects.id, Number(projectId)));
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
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
  const { role: requesterRole } = req.user;

  try {
    let query = db
      .select({
        id: users.id,
        name: users.name,
        role: users.role,
        email: users.email,
      })
      .from(users);

    if (requesterRole === "USER") {
      query = query.where(eq(users.role, "USER"));
    }

    const filteredUsers = await query;
    res.status(200).json({ users: filteredUsers });
  } catch (error) {
    res.status(500).json({ message: "Access Denied / Error fetching users" });
  }
};
