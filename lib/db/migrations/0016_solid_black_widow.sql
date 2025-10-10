-- Create new table for normalized action history
CREATE TABLE "service_request_actions" (
	"id" serial PRIMARY KEY NOT NULL,
	"service_request_id" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"actor_id" integer,
	"actor_type" varchar(20) NOT NULL,
	"action_type" varchar(20) NOT NULL,
	"status" varchar(50),
	"dispute_reason" varchar(50),
	"dispute_details" text,
	"completion_notes" text,
	"validation_notes" text,
	"issue_type" varchar(50),
	"additional_data" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "service_request_actions" ADD CONSTRAINT "service_request_actions_service_request_id_service_requests_id_fk" FOREIGN KEY ("service_request_id") REFERENCES "public"."service_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_request_actions" ADD CONSTRAINT "service_request_actions_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_actions_service_request" ON "service_request_actions" ("service_request_id");--> statement-breakpoint
CREATE INDEX "idx_actions_actor" ON "service_request_actions" ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_actions_type" ON "service_request_actions" ("action_type");--> statement-breakpoint
CREATE INDEX "idx_actions_timestamp" ON "service_request_actions" ("timestamp" DESC);--> statement-breakpoint

-- Migrate existing data from JSON columns to normalized table
DO $$
DECLARE
    req RECORD;
    action_item JSONB;
BEGIN
    FOR req IN SELECT id, action_history FROM service_requests WHERE action_history IS NOT NULL AND action_history != ''
    LOOP
        FOR action_item IN SELECT * FROM jsonb_array_elements(req.action_history::jsonb)
        LOOP
            INSERT INTO service_request_actions (
                service_request_id,
                timestamp,
                actor_id,
                actor_type,
                action_type,
                status,
                dispute_reason,
                dispute_details,
                completion_notes,
                validation_notes,
                issue_type,
                additional_data,
                created_at
            ) VALUES (
                req.id,
                (action_item->>'timestamp')::timestamp,
                (action_item->>'actorId')::integer,
                action_item->>'actorType',
                action_item->>'actionType',
                action_item->>'status',
                action_item->'data'->>'disputeReason',
                action_item->'data'->>'disputeDetails',
                action_item->'data'->>'completionNotes',
                action_item->'data'->>'notes',
                action_item->'data'->>'issueType',
                action_item->'data'::text,
                (action_item->>'timestamp')::timestamp
            );
        END LOOP;
    END LOOP;
END $$;
--> statement-breakpoint

-- Drop deprecated JSON columns after data migration
ALTER TABLE "service_requests" DROP COLUMN "action_history";--> statement-breakpoint
ALTER TABLE "service_requests" DROP COLUMN "current_action_data";