ALTER TABLE "canvas_project" RENAME COLUMN "canvasData" TO "canvas_data";--> statement-breakpoint
ALTER TABLE "canvas_project" ALTER COLUMN "canvas_data" TYPE json USING canvas_data::json;--> statement-breakpoint
ALTER TABLE "canvas_project" ALTER COLUMN "canvas_data" SET DEFAULT '{"version":"1.0","pages":[],"currentPage":0}'::json;