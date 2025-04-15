ALTER TABLE "canvas_project" RENAME TO "canvas_projects";--> statement-breakpoint
ALTER TABLE "canvas_projects" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "canvas_projects" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "canvas_projects" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "canvas_projects" DROP CONSTRAINT "canvas_project_userId_user_id_fk";
--> statement-breakpoint
ALTER TABLE "canvas_projects" ALTER COLUMN "canvas_data" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "canvas_projects" ALTER COLUMN "canvas_data" SET DEFAULT '{"version":"1.0","pages":[],"currentPage":0,"complete_doors_and_windows":[],"single_doors":[],"double_doors":[],"windows":[],"single_doors_and_windows":[],"single_doors_and_double_doors":[],"double_doors_and_windows":[]}'::jsonb;--> statement-breakpoint
ALTER TABLE "canvas_projects" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "canvas_projects" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_projects" ADD CONSTRAINT "canvas_projects_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
