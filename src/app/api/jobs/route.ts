import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { jobHuntTrackerJobApplications } from "@/db/schema";
import { jobApplicationSchema } from "@/lib/validations";
import { z } from "zod";
import { eq, and, ilike, or, sql, desc } from "drizzle-orm";

async function getSessionFromRequest(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  return session;
}

// GET /api/jobs?search=...&status=...
export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const searchQuery = searchParams.get("search") || "";
  const statusFilter = searchParams.get("status") || "";

  const conditions = [
    eq(jobHuntTrackerJobApplications.userId, session.user.id),
  ];

  if (searchQuery.trim()) {
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

  if (statusFilter && statusFilter !== "all") {
    conditions.push(eq(jobHuntTrackerJobApplications.status, statusFilter as any));
  }

  const results = await db
    .select()
    .from(jobHuntTrackerJobApplications)
    .where(and(...conditions))
    .orderBy(desc(jobHuntTrackerJobApplications.updatedAt));

  return NextResponse.json({ data: results });
}

// POST /api/jobs
export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    return NextResponse.json({ data: newJob }, { status: 201 });
  } catch (error) {
    console.error("Failed to create job application:", error);
    return NextResponse.json(
      { error: "Failed to create job application." },
      { status: 500 }
    );
  }
}
