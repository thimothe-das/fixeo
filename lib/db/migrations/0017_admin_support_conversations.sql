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
ALTER TABLE "admin_support_conversations" ADD CONSTRAINT "admin_support_conversations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_support_conversations" ADD CONSTRAINT "admin_support_conversations_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_support_user_idx" ON "admin_support_conversations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "admin_support_created_at_idx" ON "admin_support_conversations" USING btree ("created_at");

