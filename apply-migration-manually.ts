import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { db } from "./lib/db/drizzle";

async function applyMigration() {
  try {
    const migrationSQL = readFileSync(
      "./lib/db/migrations/0017_admin_support_conversations.sql",
      "utf-8"
    );
    console.log("Migration SQL:");
    console.log(migrationSQL);
    console.log("\n---Applying migration---\n");

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      console.log("Executing:", statement.substring(0, 100) + "...");
      try {
        await db.execute(sql.raw(statement));
        console.log("✓ Success");
      } catch (error: any) {
        console.error("✗ Error:", error.message);
      }
    }

    console.log("\n---Verifying table exists---\n");
    const result = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_support_conversations'
      );
    `);

    console.log("Table exists:", result);
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

applyMigration();
