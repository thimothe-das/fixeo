CREATE TABLE "service_request_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"status" "service_request_status" NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "sender_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."message_sender_type";--> statement-breakpoint
CREATE TYPE "public"."message_sender_type" AS ENUM('client', 'professional', 'admin');--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "sender_type" SET DATA TYPE "public"."message_sender_type" USING "sender_type"::"public"."message_sender_type";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'client';--> statement-breakpoint
ALTER TABLE "service_request_status_history" ADD CONSTRAINT "service_request_status_history_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;