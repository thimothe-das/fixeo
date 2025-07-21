CREATE TABLE "service_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_type" varchar(50) NOT NULL,
	"urgency" varchar(20) NOT NULL,
	"description" text NOT NULL,
	"location" text NOT NULL,
	"photos" text,
	"client_email" varchar(255),
	"client_phone" varchar(20),
	"client_name" varchar(100),
	"user_id" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"assigned_artisan_id" integer,
	"estimated_price" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assigned_artisan_id_users_id_fk" FOREIGN KEY ("assigned_artisan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;