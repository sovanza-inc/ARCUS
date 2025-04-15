import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { migrate } from "drizzle-orm/neon-http/migrator";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const main = async () => {
  try {
    console.log("Running migrations...");
    
    // Run migrations
    await migrate(db, { migrationsFolder: "./drizzle" });
    
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error during migration:", error);
    process.exit(1);
  }
};

main();