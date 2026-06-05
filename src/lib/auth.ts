import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.jobHuntTrackerUser,
      session: schema.jobHuntTrackerSession,
      account: schema.jobHuntTrackerAccount,
      verification: schema.jobHuntTrackerVerification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const allowedEmail = process.env.MY_EMAIL;
          if (!allowedEmail) {
            return false;
          }
          if (user.email.toLowerCase() !== allowedEmail.toLowerCase()) {
            return false;
          }
        },
      },
    },
  },
  trustedOrigins: [process.env.BETTER_AUTH_URL || "http://localhost:3003"],
});
