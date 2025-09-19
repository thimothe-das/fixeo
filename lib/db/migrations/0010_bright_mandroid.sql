ALTER TABLE "service_requests" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'awaiting_estimate'::text;--> statement-breakpoint
DROP TYPE "public"."service_request_status";--> statement-breakpoint
CREATE TYPE "public"."service_request_status" AS ENUM('awaiting_payment', 'awaiting_estimate', 'awaiting_assignation', 'in_progress', 'client_validated', 'artisan_validated', 'completed', 'disputed_by_client', 'disputed_by_artisan', 'disputed_by_both', 'resolved', 'cancelled');--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'awaiting_payment'::"public"."service_request_status";--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DATA TYPE "public"."service_request_status" USING "status"::"public"."service_request_status";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" text;--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "down_payment_amount";--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "down_payment_status";--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "stripe_payment_intent_id";--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "down_payment_paid_at";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_stripe_customer_id_unique" UNIQUE("stripe_customer_id");--> statement-breakpoint
DROP TYPE "public"."down_payment_status";