import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobHuntTrackerJobApplications } from "@/db/schema";
import { jobApplicationSchema } from "@/lib/validations";
import { z } from "zod";
import { eq, and } from "drizzle-orm";

async function getSessionFromRequest(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

// GET /api/jobs/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [job] = await db
    .select()
    .from(jobHuntTrackerJobApplications)
    .where(
      and(
        eq(jobHuntTrackerJobApplications.id, id),
        eq(jobHuntTrackerJobApplications.userId, session.user.id)
      )
    )
    .limit(1);

  if (!job) {
    return NextResponse.json(
      { error: "Job application not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: job });
}

// PUT /api/jobs/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = jobApplicationSchema.safeParse(body);
  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error);
    return NextResponse.json(
      { error: "Validation failed", errors: flattened.fieldErrors },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const [existing] = await db
      .select({ status: jobHuntTrackerJobApplications.status })
      .from(jobHuntTrackerJobApplications)
      .where(
        and(
          eq(jobHuntTrackerJobApplications.id, id),
          eq(jobHuntTrackerJobApplications.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Job application not found." },
        { status: 404 }
      );
    }

    const statusChanged = existing.status !== data.status;

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

    return NextResponse.json({ data: updatedJob });
  } catch (error) {
    console.error("Failed to update job application:", error);
    return NextResponse.json(
      { error: "Failed to update job application." },
      { status: 500 }
    );
  }
}

// DELETE /api/jobs/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
      return NextResponse.json(
        { error: "Job application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Job application deleted successfully!",
    });
  } catch (error) {
    console.error("Failed to delete job application:", error);
    return NextResponse.json(
      { error: "Failed to delete job application." },
      { status: 500 }
    );
  }
}
