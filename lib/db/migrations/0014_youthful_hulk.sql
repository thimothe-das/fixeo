CREATE TABLE "artisan_refused_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"artisan_id" integer NOT NULL,
	"service_request_id" integer NOT NULL,
	"refused_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artisan_refused_requests" ADD CONSTRAINT "artisan_refused_requests_artisan_id_users_id_fk" FOREIGN KEY ("artisan_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "artisan_refused_requests" ADD CONSTRAINT "artisan_refused_requests_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;