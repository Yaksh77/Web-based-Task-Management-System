import { and, lt, notInArray } from "drizzle-orm";
import { db } from "../config/db.js";
import { tasks } from "../models/schema.js";
import cron from "node-cron";

export const taskOverdueJob = () => {
  cron.schedule("* 1 * * *", async () => {
    console.log("Job for searching overdue tasks is started...");
    try {
      const today = new Date();

      await db
        .update(tasks)
        .set({ status: "OVERDUE", updatedAt: new Date() })
        .where(
          and(
            lt(tasks.dueDate, today),
            notInArray(tasks.status, ["COMPLETED", "OVERDUE"])
          )
        );

      console.log("Job for searching overdue tasks is completed...");
    } catch (error) {
      console.log(error);
    }
  });
};
