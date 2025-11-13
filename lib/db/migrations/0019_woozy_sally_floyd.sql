ALTER TYPE "public"."service_request_status" ADD VALUE 'awaiting_dual_acceptance' BEFORE 'awaiting_assignation';--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "artisan_accepted" boolean;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "client_accepted" boolean;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "artisan_response_date" timestamp;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "client_response_date" timestamp;--> statement-breakpoint
ALTER TABLE "billing_estimates" DROP COLUMN "artisan_rejection_photos";