import { and, eq } from "drizzle-orm";
import { db } from "./drizzle";
import { serviceRequests, serviceRequestStatusHistory } from "./schema";

/**
 * Backfill status history for existing service requests
 * This creates initial status history entries based on the current status
 * and createdAt timestamp of each service request
 */
async function backfillStatusHistory() {
  console.log("Starting status history backfill...");

  // Get all service requests
  const requests = await db.select().from(serviceRequests);

  console.log(`Found ${requests.length} service requests to process`);

  let processed = 0;
  let skipped = 0;

  for (const request of requests) {
    try {
      // Check if this request already has status history
      const existingHistory = await db
        .select()
        .from(serviceRequestStatusHistory)
        .where(
          and(
            eq(serviceRequestStatusHistory.serviceRequestId, request.id),
            eq(serviceRequestStatusHistory.status, request.status)
          )
        );

      if (existingHistory.length > 0) {
        skipped++;
        continue;
      }

      // Create status history entry with the request's createdAt date
      // Note: This is a simplified backfill - in reality, we'd want to track
      // each status change separately, but since we don't have that historical data,
      // we'll just create an entry for the current status
      await db.insert(serviceRequestStatusHistory).values({
        serviceRequestId: request.id,
        status: request.status,
        changedAt: request.createdAt, // Use the request's creation date as fallback
      });

      processed++;
    } catch (error) {
      console.error(`Error processing request ${request.id}:`, error);
    }
  }

  console.log(`Backfill complete: ${processed} processed, ${skipped} skipped`);
}

// Run the backfill if this script is executed directly
if (require.main === module) {
  backfillStatusHistory()
    .then(() => {
      console.log("Backfill completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Backfill failed:", error);
      process.exit(1);
    });
}

export { backfillStatusHistory };
