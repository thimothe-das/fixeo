-- Add awaiting_dual_acceptance status to service_request_status enum
ALTER TYPE "service_request_status" ADD VALUE 'awaiting_dual_acceptance';

-- Add dual acceptance fields to billing_estimates table
ALTER TABLE "billing_estimates" ADD COLUMN "artisan_accepted" boolean;
ALTER TABLE "billing_estimates" ADD COLUMN "client_accepted" boolean;
ALTER TABLE "billing_estimates" ADD COLUMN "artisan_response_date" timestamp;
ALTER TABLE "billing_estimates" ADD COLUMN "client_response_date" timestamp;

