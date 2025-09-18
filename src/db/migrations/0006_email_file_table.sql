CREATE TABLE IF NOT EXISTS "email_file" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"filename" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" integer NOT NULL,
	"content" bytea NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_file" ADD CONSTRAINT "email_file_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_file_user_id_idx" ON "email_file" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "email_file_filename_idx" ON "email_file" USING btree ("filename");