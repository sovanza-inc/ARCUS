CREATE TABLE IF NOT EXISTS "canvas_project" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" text NOT NULL,
	"canvasData" text NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "canvas_project" ADD CONSTRAINT "canvas_project_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
