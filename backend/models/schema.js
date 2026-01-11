import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  pgEnum,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("user_role", ["ADMIN", "USER"]);
export const statusEnum = pgEnum("task_status", [
  "TODO",
  "IN_PROGRESS",
  "IN_TESTING",
  "COMPLETED",
  "OVERDUE",
]);
export const priorityEnum = pgEnum("task_priority", ["LOW", "MEDIUM", "HIGH"]);

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: roleEnum("role").default("USER"),
  createdAt: timestamp("createdAt").defaultNow(),
});

// Projects Table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  createdBy: integer("createdBy").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: statusEnum("status").default("TODO"),
  priority: priorityEnum("priority").default("MEDIUM"),
  dueDate: timestamp("dueDate"),
  createdBy: integer("createdBy").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// Comments Table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  description: text("description").notNull(),
  taskId: integer("taskId")
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  createdBy: integer("createdBy").references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// --- MAPPING TABLES ---

// 1. Project -> User
export const projectUserMapping = pgTable(
  "project_user_mapping",
  {
    projectId: integer("projectId").references(() => projects.id, {
      onDelete: "cascade",
    }),
    userId: integer("userId").references(() => users.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.userId] }),
  })
);

// 2. Project -> Task
export const projectTaskMapping = pgTable(
  "project_task_mapping",
  {
    projectId: integer("projectId").references(() => projects.id, {
      onDelete: "cascade",
    }),
    taskId: integer("taskId").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.projectId, table.taskId] }),
  })
);

// 3. User -> Task
export const userTaskMapping = pgTable(
  "user_task_mapping",
  {
    userId: integer("userId").references(() => users.id, {
      onDelete: "cascade",
    }),
    taskId: integer("taskId").references(() => tasks.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("createdAt").defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.taskId] }),
  })
);

// --- ACTIVITY LOGS ---
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  taskId: integer("taskId").references(() => tasks.id, { onDelete: "cascade" }),
  userId: integer("userId").references(() => users.id, {
    onDelete: "set null",
  }),
  action: varchar("action", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});
