ALTER TABLE "payment" ADD COLUMN "canceled_at" timestamp;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "cancel_reason" text;