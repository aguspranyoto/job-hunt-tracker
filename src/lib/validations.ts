import { z } from "zod";

export const JOB_STATUSES = [
  "Bookmarked",
  "Applied",
  "Screening",
  "Interviewing",
  "Offer",
  "Rejected",
  "Ghosted",
] as const;

export const jobApplicationSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name is too long"),
  jobPosition: z
    .string()
    .min(1, "Job position is required")
    .max(255, "Job position is too long"),
  status: z.enum(JOB_STATUSES, {
    error: "Status is required",
  }),
  companyLocation: z.string().max(255).optional().or(z.literal("")),
  salaryRange: z.string().max(255).optional().or(z.literal("")),
  jobUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  benefits: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  dateApplied: z.string().optional().or(z.literal("")),
});

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>;
