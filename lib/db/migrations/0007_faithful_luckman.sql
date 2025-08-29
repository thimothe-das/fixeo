-- Step 1: Update existing data to use new enum values
UPDATE service_requests 
SET status = 'awaiting_assignation' 
WHERE status = 'pending';

UPDATE service_requests 
SET status = 'in_progress' 
WHERE status = 'accepted';

-- Step 2: Create the new enum types
CREATE TYPE "public"."billing_estimate_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');--> statement-breakpoint
CREATE TYPE "public"."service_request_status" AS ENUM('awaiting_estimate', 'awaiting_assignation', 'in_progress', 'client_validated', 'artisan_validated', 'completed', 'disputed_by_client', 'disputed_by_artisan', 'disputed_by_both', 'resolved', 'cancelled');--> statement-breakpoint

-- Step 3: Apply enum constraints
ALTER TABLE "billing_estimates" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."billing_estimate_status";--> statement-breakpoint
ALTER TABLE "billing_estimates" ALTER COLUMN "status" SET DATA TYPE "public"."billing_estimate_status" USING "status"::"public"."billing_estimate_status";--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'awaiting_estimate'::"public"."service_request_status";--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DATA TYPE "public"."service_request_status" USING "status"::"public"."service_request_status";