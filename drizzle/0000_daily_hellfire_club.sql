CREATE TYPE "public"."job_status" AS ENUM('Bookmarked', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Rejected', 'Ghosted');--> statement-breakpoint
CREATE TABLE "job_hunt_tracker_account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_hunt_tracker_job_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_position" varchar(255) NOT NULL,
	"status" "job_status" DEFAULT 'Bookmarked' NOT NULL,
	"company_location" varchar(255),
	"salary_range" varchar(255),
	"job_url" text,
	"benefits" text,
	"notes" text,
	"date_applied" date,
	"last_status_update" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_hunt_tracker_session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "job_hunt_tracker_session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "job_hunt_tracker_user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_hunt_tracker_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "job_hunt_tracker_verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_hunt_tracker_account" ADD CONSTRAINT "job_hunt_tracker_account_user_id_job_hunt_tracker_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."job_hunt_tracker_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_hunt_tracker_job_applications" ADD CONSTRAINT "job_hunt_tracker_job_applications_user_id_job_hunt_tracker_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."job_hunt_tracker_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_hunt_tracker_session" ADD CONSTRAINT "job_hunt_tracker_session_user_id_job_hunt_tracker_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."job_hunt_tracker_user"("id") ON DELETE cascade ON UPDATE no action;