"use server";

import { db } from "@/db";
import {
  jobHuntTrackerJobApplications,
  type JobApplication,
} from "@/db/schema";
import { getSession } from "@/lib/session";
import { jobApplicationSchema } from "@/lib/validations";
import { z } from "zod";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type ActionResult = {
  success: boolean;
  message: string;
  data?: JobApplication;
  errors?: Record<string, string[]>;
};

export async function getJobApplications(searchQuery?: string): Promise<JobApplication[]> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const conditions = [
    eq(jobHuntTrackerJobApplications.userId, session.user.id),
  ];

  if (searchQuery && searchQuery.trim() !== "") {
    const search = `%${searchQuery.trim()}%`;
    conditions.push(
      or(
        ilike(jobHuntTrackerJobApplications.companyName, search),
        ilike(jobHuntTrackerJobApplications.jobPosition, search),
        ilike(jobHuntTrackerJobApplications.companyLocation, search),
        ilike(jobHuntTrackerJobApplications.salaryRange, search),
        sql`CAST(${jobHuntTrackerJobApplications.status} AS TEXT) ILIKE ${search}`
      )!
    );
  }

  const results = await db
    .select()
    .from(jobHuntTrackerJobApplications)
    .where(and(...conditions))
    .orderBy(desc(jobHuntTrackerJobApplications.updatedAt));

  return results;
}

export async function createJobApplication(
  formData: unknown
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

  const parsed = jobApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flattened.fieldErrors)) {
      fieldErrors[key] = value as string[];
    }
    return {
      success: false,
      message: "Validation failed",
      errors: fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const [newJob] = await db
      .insert(jobHuntTrackerJobApplications)
      .values({
        userId: session.user.id,
        companyName: data.companyName,
        jobPosition: data.jobPosition,
        status: data.status,
        companyLocation: data.companyLocation || null,
        salaryRange: data.salaryRange || null,
        jobUrl: data.jobUrl || null,
        benefits: data.benefits || null,
        notes: data.notes || null,
        dateApplied: data.dateApplied || null,
        lastStatusUpdate: new Date(),
      })
      .returning();

    revalidatePath("/");
    return {
      success: true,
      message: "Job application created successfully!",
      data: newJob,
    };
  } catch (error) {
    console.error("Failed to create job application:", error);
    return { success: false, message: "Failed to create job application." };
  }
}

export async function updateJobApplication(
  id: string,
  formData: unknown,
  previousStatus?: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

  const parsed = jobApplicationSchema.safeParse(formData);
  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    const fieldErrors: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(flattened.fieldErrors)) {
      fieldErrors[key] = value as string[];
    }
    return {
      success: false,
      message: "Validation failed",
      errors: fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    // If status changed, update lastStatusUpdate
    const statusChanged = previousStatus && previousStatus !== data.status;

    const [updatedJob] = await db
      .update(jobHuntTrackerJobApplications)
      .set({
        companyName: data.companyName,
        jobPosition: data.jobPosition,
        status: data.status,
        companyLocation: data.companyLocation || null,
        salaryRange: data.salaryRange || null,
        jobUrl: data.jobUrl || null,
        benefits: data.benefits || null,
        notes: data.notes || null,
        dateApplied: data.dateApplied || null,
        ...(statusChanged ? { lastStatusUpdate: new Date() } : {}),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobHuntTrackerJobApplications.id, id),
          eq(jobHuntTrackerJobApplications.userId, session.user.id)
        )
      )
      .returning();

    if (!updatedJob) {
      return { success: false, message: "Job application not found." };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Job application updated successfully!",
      data: updatedJob,
    };
  } catch (error) {
    console.error("Failed to update job application:", error);
    return { success: false, message: "Failed to update job application." };
  }
}

export async function deleteJobApplication(
  id: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized" };

  try {
    const [deleted] = await db
      .delete(jobHuntTrackerJobApplications)
      .where(
        and(
          eq(jobHuntTrackerJobApplications.id, id),
          eq(jobHuntTrackerJobApplications.userId, session.user.id)
        )
      )
      .returning();

    if (!deleted) {
      return { success: false, message: "Job application not found." };
    }

    revalidatePath("/");
    return {
      success: true,
      message: "Job application deleted successfully!",
    };
  } catch (error) {
    console.error("Failed to delete job application:", error);
    return { success: false, message: "Failed to delete job application." };
  }
}
