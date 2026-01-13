import { aliasedTable, and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import {
  tasks,
  userTaskMapping,
  projectTaskMapping,
  users,
  projectUserMapping,
  projects,
  comments,
  activityLogs,
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

      await tx.insert(activityLogs).values({
        taskId: newTask.id,
        userId: req.user.id,
        action: "created the task",
        createdAt: new Date(),
      });

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

  // Query params
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const status = req.query.status || "ALL";
  const priority = req.query.priority || "ALL";
  const sortBy = req.query.sortBy || "createdAt";
  const sortOrder = req.query.sortOrder === "asc" ? asc : desc;

  const offset = (page - 1) * limit;

  try {
    const creator = aliasedTable(users, "creator");
    const assignee = aliasedTable(users, "assignee");

    let conditions = [];
    if (role !== "ADMIN") {
      conditions.push(eq(userTaskMapping.userId, Number(userId)));
    }
    if (status !== "ALL") conditions.push(eq(tasks.status, status));
    if (priority !== "ALL") conditions.push(eq(tasks.priority, priority));
    if (search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(projects.title, `%${search}%`)
        )
      );
    }

    const [totalCount] = await db
      .select({ count: sql`count(*)` })
      .from(tasks)
      .leftJoin(userTaskMapping, eq(tasks.id, userTaskMapping.taskId))
      .leftJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
      .leftJoin(projects, eq(projectTaskMapping.projectId, projects.id))
      .where(and(...conditions));

    const userTasks = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
        dueDate: tasks.dueDate,
        description: tasks.description,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,
        projectId: projects.id,
        projectName: projects.title,
        createdByName: creator.name,
        assignedToName: assignee.name,
      })
      .from(tasks)
      .leftJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
      .leftJoin(projects, eq(projectTaskMapping.projectId, projects.id))
      .leftJoin(creator, eq(tasks.createdBy, creator.id))
      .leftJoin(userTaskMapping, eq(tasks.id, userTaskMapping.taskId))
      .leftJoin(assignee, eq(userTaskMapping.userId, assignee.id))
      .where(and(...conditions))
      .orderBy(sortOrder(tasks[sortBy]))
      .limit(limit)
      .offset(offset);

    res.status(200).json({
      tasks: userTasks,
      pagination: {
        totalTasks: Number(totalCount.count),
        totalPages: Math.ceil(Number(totalCount.count) / limit),
        currentPage: page,
        limit: limit,
      },
    });
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
        dueDate: tasks.dueDate,
        projectName: projects.title,
        assignedToName: users.name,
      })
      .from(tasks)
      .innerJoin(projectTaskMapping, eq(tasks.id, projectTaskMapping.taskId))
      .innerJoin(projects, eq(projectTaskMapping.projectId, projects.id))
      .leftJoin(userTaskMapping, eq(tasks.id, userTaskMapping.taskId))
      .leftJoin(users, eq(userTaskMapping.userId, users.id))
      .where(eq(projectTaskMapping.projectId, Number(projectId)));

    res.status(200).json({ tasks: projectTasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
  const currentUserId = req.user.id;

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
        
      const [oldMapping] = await tx
        .select()
        .from(userTaskMapping)
        .where(eq(userTaskMapping.taskId, Number(taskId)));

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
      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;

        if (status === undefined && existingTask.status !== "TODO") {
          updateData.status = "IN_PROGRESS";
        }
      }

      updateData.updatedAt = new Date();

      await tx
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, Number(taskId)));

      let logEntries = [];

      if (status && status !== existingTask.status) {
        logEntries.push(
          `changed status from ${existingTask.status} to ${status}`
        );
      }
      if (priority && priority !== existingTask.priority) {
        logEntries.push(`changed priority to ${priority}`);
      }
      if (assignedUserId && Number(assignedUserId) !== oldMapping?.userId) {
        const [newUser] = await tx
          .select()
          .from(users)
          .where(eq(users.id, Number(assignedUserId)));
        logEntries.push(`reassigned task to ${newUser.name}`);
      }

      // I have to check for the common case where both frontend and backend dates becomes same
      const incomingDate = dueDate
        ? new Date(dueDate).toISOString().split("T")[0]
        : null;
      const dbDate = existingTask.dueDate
        ? new Date(existingTask.dueDate).toISOString().split("T")[0]
        : null;

      if (dueDate !== undefined && incomingDate !== dbDate) {
        logEntries.push(
          `changed due date from ${new Date(
            existingTask.dueDate
          ).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })} to ${new Date(dueDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })}`
        );
      }

      for (const actionText of logEntries) {
        await tx.insert(activityLogs).values({
          taskId: Number(taskId),
          userId: currentUserId,
          action: actionText,
          createdAt: new Date(),
        });
      }

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

    res
      .status(200)
      .json({ message: "Task updated and changes logged successfully" });
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

export const createComment = async (req, res) => {
  const { taskId, description } = req.body;
  const userId = req.user.id;

  try {
    const [membership] = await db
      .select()
      .from(projectTaskMapping)
      .innerJoin(
        projectUserMapping,
        eq(projectTaskMapping.projectId, projectUserMapping.projectId)
      )
      .where(
        and(
          eq(projectTaskMapping.taskId, Number(taskId)),
          eq(projectUserMapping.userId, Number(userId))
        )
      );

    if (!membership && req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "You are not a member of this project." });
    }

    await db
      .insert(comments)
      .values({ description, taskId, createdBy: userId });

    // await db
    //   .insert(activityLogs)
    //   .values({ taskId, userId, action: "added a comment" });

    res.status(201).json({ message: "Comment added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  try {
    await db.delete(comments).where(eq(comments.id, commentId));
    res.status(200).json({ message: "Comment Deleted Succssfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { description } = req.body;
  try {
    if (description === "")
      return res
        .status(200)
        .json({ message: "Updating description should not be empty" });
    await db
      .update(comments)
      .set({ description: description })
      .where(eq(comments.id, commentId));

    return res.status(200).json({ message: "Comment udated successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error updating comment", error: error.message });
  }
};

export const getTaskDetails = async (req, res) => {
  const { taskId } = req.params;

  try {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, Number(taskId)));

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const taskComments = await db
      .select({
        id: comments.id,
        description: comments.description,
        createdAt: comments.createdAt,
        user: users.name,
        userId: users.id,
      })
      .from(comments)
      .innerJoin(users, eq(comments.createdBy, users.id))
      .where(eq(comments.taskId, Number(taskId)))
      .orderBy(asc(comments.createdAt));

    const logs = await db
      .select({
        id: activityLogs.id,
        action: activityLogs.action,
        createdAt: activityLogs.createdAt,
        userName: users.name,
      })
      .from(activityLogs)
      .innerJoin(users, eq(activityLogs.userId, users.id))
      .where(eq(activityLogs.taskId, Number(taskId)))
      .orderBy(desc(activityLogs.createdAt));

    return res.status(200).json({
      task,
      taskComments,
      logs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
