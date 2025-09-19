CREATE TYPE "public"."down_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
ALTER TYPE "public"."service_request_status" ADD VALUE 'awaiting_payment' BEFORE 'awaiting_estimate';--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "down_payment_amount" integer;--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "down_payment_status" "down_payment_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "stripe_payment_intent_id" text;--> statement-breakpoint
ALTER TABLE "service_requests" ADD COLUMN "down_payment_paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "client_phone";--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "client_name";