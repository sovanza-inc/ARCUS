CREATE TABLE IF NOT EXISTS "takeoffs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "quote_number" varchar(50) NOT NULL,
    "client_name" varchar(255) NOT NULL,
    "client_email" varchar(255) NOT NULL,
    "status" varchar(50) NOT NULL DEFAULT 'Pending',
    "created_at" timestamp DEFAULT now(),
    "updated_at" timestamp DEFAULT now()
);
