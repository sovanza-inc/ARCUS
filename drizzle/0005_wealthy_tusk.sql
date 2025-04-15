CREATE TABLE IF NOT EXISTS "calendar_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"all_day" boolean DEFAULT false,
	"location" text,
	"color" varchar(7) DEFAULT '#FF5F1F',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"user_id" text NOT NULL,
	"recurring" jsonb DEFAULT '{"type":"none","interval":1,"until":null}'::jsonb,
	"reminder_minutes" integer,
	"status" varchar(20) DEFAULT 'confirmed'
);
