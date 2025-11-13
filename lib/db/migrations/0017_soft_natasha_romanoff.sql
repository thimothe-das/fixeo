ALTER TYPE "public"."service_request_status" ADD VALUE 'awaiting_estimate_revision' BEFORE 'awaiting_assignation';--> statement-breakpoint
CREATE TABLE "admin_support_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"sender_type" "message_sender_type" NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "artisan_rejection_reason" text;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "rejected_by_artisan_id" integer;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "rejected_at" timestamp;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD COLUMN "revision_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "admin_support_conversations" ADD CONSTRAINT "admin_support_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_support_conversations" ADD CONSTRAINT "admin_support_conversations_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD CONSTRAINT "billing_estimates_rejected_by_artisan_id_users_id_fk" FOREIGN KEY ("rejected_by_artisan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;