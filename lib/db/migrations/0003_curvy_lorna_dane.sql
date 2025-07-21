ALTER TABLE "service_requests" ADD COLUMN "guest_token" varchar(36);--> statement-breakpoint
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_guest_token_unique" UNIQUE("guest_token");