ALTER TABLE "tasks" DROP CONSTRAINT "tasks_taskId_tasks_id_fk";
--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "taskId" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_taskId_tasks_id_fk" FOREIGN KEY ("taskId") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" DROP COLUMN "taskId";