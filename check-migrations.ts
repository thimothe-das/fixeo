import { sql } from "drizzle-orm";
import { db } from "./lib/db/drizzle";

async function checkMigrations() {
  try {
    const result = await db.execute(sql`
      SELECT * FROM drizzle.__drizzle_migrations 
      ORDER BY created_at DESC 
      LIMIT 10;
    `);

    console.log("Applied migrations:");
    console.log(result);
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

checkMigrations();
