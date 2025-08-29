CREATE TABLE "billing_estimates" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"admin_id" integer NOT NULL,
	"estimated_price" integer NOT NULL,
	"description" text NOT NULL,
	"breakdown" text,
	"valid_until" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"client_response" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_requests" ALTER COLUMN "status" SET DEFAULT 'awaiting_estimate';--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD CONSTRAINT "billing_estimates_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "billing_estimates" ADD CONSTRAINT "billing_estimates_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;