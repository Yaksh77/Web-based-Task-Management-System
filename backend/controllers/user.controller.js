import { eq, sql } from "drizzle-orm";
import {
  tasks,
  userTaskMapping,
  projectTaskMapping,
  users,
  projectUserMapping,
  projects,
} from "../models/schema.js";
import { db } from "../config/db.js";

export const addTask = async (req, res) => {
  const {
    title,
    description,
    priority,
    dueDate,
    createdBy,
    projectId,
    assignedUserId,
  } = req.body;

  try {
    const result = await db.transaction(async (tx) => {
      const [newTask] = await tx
        .insert(tasks)
        .values({
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          createdBy,
        })
        .returning();

      if (projectId) {
        await tx.insert(projectTaskMapping).values({
          projectId: projectId,
          taskId: newTask.id,
        });
      }

      if (assignedUserId) {
        await tx.insert(userTaskMapping).values({
          userId: assignedUserId,
          taskId: newTask.id,
        });
      }

      return newTask;
    });

    res
      .status(201)
      .json({ message: "Task created and mapped successfully", task: result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating task", error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;
  try {
    const result = await db
      .update(users)
      .set({ role: newRole })
      .where(eq(users.id, Number(userId)));

    res.status(200).json({ message: `User role updated to ${newRole}` });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.delete(users).where(eq(users.id, Number(userId)));
    res.status(200).json({ message: `User deleted successfully` });
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getUserProjects = async (req, res) => {
  const { id: userId, role } = req.user;
  const { currentProjectId } = req.query;

  try {
    let query;

    if (role === "ADMIN") {
      query = db.select().from(projects);
    } else {
      query = db
        .select({
          id: projects.id,
          title: projects.title,
          description: projects.description,
        })
        .from(projects)
        .innerJoin(
          projectUserMapping,
          eq(projects.id, projectUserMapping.projectId)
        )
        .where(eq(projectUserMapping.userId, Number(userId)));
    }

    if (currentProjectId) {
      query = query.orderBy(
        sql`CASE WHEN ${projects.id} = ${Number(
          currentProjectId
        )} THEN 0 ELSE 1 END`,
        projects.title
      );
    } else {
      query = query.orderBy(projects.title);
    }

    const assignedProjects = await query;
    res.status(200).json({ projects: assignedProjects });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  const { id: userId, role } = req.user;

  try {
    let userTasks;
    if (role === "ADMIN") {
      userTasks = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          priority: tasks.priority,
          description: tasks.description,
          dueDate: tasks.dueDate,
          projectName: projects.title,
          projectId: projects.id,
        })
        .from(tasks)
        .leftJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
        .leftJoin(projects, eq(projectTaskMapping.projectId, projects.id));
    } else {
      userTasks = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          status: tasks.status,
          priority: tasks.priority,
          description: tasks.description,
          dueDate: tasks.dueDate,
          projectName: projects.title,
          projectId: projects.id,
        })
        .from(tasks)
        .innerJoin(userTaskMapping, eq(tasks.id, userTaskMapping.taskId))
        .innerJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
        .innerJoin(projects, eq(projectTaskMapping.projectId, projects.id))
        .where(eq(userTaskMapping.userId, Number(userId)));
    }
    res.status(200).json({ tasks: userTasks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching tasks", error: error.message });
  }
};

export const getProjectTasks = async (req, res) => {
  const { projectId } = req.params;

  try {
    const projectTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        description: tasks.description,
        dueDate: tasks.dueDate,
      })
      .from(tasks)
      .innerJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
      .where(eq(projectTaskMapping.projectId, Number(projectId)));

    res.status(200).json({ tasks: projectTasks });
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const {
    title,
    description,
    status,
    priority,
    dueDate,
    assignedUserId,
    projectId,
  } = req.body;

  const STATUS_FLOW = {
    TODO: "IN_PROGRESS",
    IN_PROGRESS: "IN_TESTING",
    IN_TESTING: "COMPLETED",
  };

  try {
    await db.transaction(async (tx) => {
      const [existingTask] = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.id, Number(taskId)));

      // Validation for stauts changing that user only can go to the next one status or step
      if (status !== undefined && status !== existingTask.status) {
        if (STATUS_FLOW[existingTask.status] !== status) {
          throw new Error(
            `Invalid transition: From ${
              existingTask.status
            } you can only go to ${STATUS_FLOW[existingTask.status]}`
          );
        }
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status !== undefined) updateData.status = status;
      if (priority !== undefined) updateData.priority = priority;
      if (dueDate !== undefined)
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      updateData.updatedAt = new Date();

      await tx
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, Number(taskId)));

      if (projectId !== undefined) {
        await tx
          .update(projectTaskMapping)
          .set({ projectId: Number(projectId) })
          .where(eq(projectTaskMapping.taskId, Number(taskId)));
      }

      if (assignedUserId !== undefined) {
        await tx
          .update(userTaskMapping)
          .set({ userId: Number(assignedUserId) })
          .where(eq(userTaskMapping.taskId, Number(taskId)));
      }
    });

    res.status(200).json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  try {
    await db.delete(tasks).where(eq(tasks.id, Number(taskId)));
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;
  try {
    const projectMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
      })
      .from(users)
      .innerJoin(projectUserMapping, eq(users.id, projectUserMapping.userId))
      .where(eq(projectUserMapping.projectId, Number(projectId)));
    res.status(200).json({ projectMembers });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching project members",
      error: error.message,
    });
  }
};
