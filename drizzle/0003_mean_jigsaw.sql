CREATE TABLE IF NOT EXISTS "takeoffs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"quote_number" varchar(50) NOT NULL,
	"client_name" varchar(255) NOT NULL,
	"client_email" varchar(255) NOT NULL,
	"status" varchar(50) DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
