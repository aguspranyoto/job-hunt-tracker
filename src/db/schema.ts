import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  date,
  pgEnum,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

// =========================================
// Better Auth Tables (prefixed)
// =========================================

export const jobHuntTrackerUser = pgTable("job_hunt_tracker_user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobHuntTrackerSession = pgTable("job_hunt_tracker_session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => jobHuntTrackerUser.id, { onDelete: "cascade" }),
});

export const jobHuntTrackerAccount = pgTable("job_hunt_tracker_account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => jobHuntTrackerUser.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const jobHuntTrackerVerification = pgTable(
  "job_hunt_tracker_verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// =========================================
// Job Application Schema
// =========================================

export const jobStatusEnum = pgEnum("job_status", [
  "Bookmarked",
  "Applied",
  "Screening",
  "Interviewing",
  "Offer",
  "Rejected",
  "Ghosted",
]);

export const jobHuntTrackerJobApplications = pgTable(
  "job_hunt_tracker_job_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => jobHuntTrackerUser.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    jobPosition: varchar("job_position", { length: 255 }).notNull(),
    status: jobStatusEnum("status").notNull().default("Bookmarked"),
    companyLocation: varchar("company_location", { length: 255 }),
    salaryRange: varchar("salary_range", { length: 255 }),
    jobUrl: text("job_url"),
    benefits: text("benefits"),
    notes: text("notes"),
    dateApplied: date("date_applied"),
    lastStatusUpdate: timestamp("last_status_update").defaultNow(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  }
);

// Type exports
export type JobApplication = typeof jobHuntTrackerJobApplications.$inferSelect;
export type NewJobApplication = typeof jobHuntTrackerJobApplications.$inferInsert;
export type JobStatus = (typeof jobStatusEnum.enumValues)[number];
