import { getSession } from "@/lib/session";
import { getJobApplications } from "@/app/actions";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard-header";
import { StatsCards } from "@/components/stats-cards";
import { JobsDataTable } from "@/components/jobs-data-table";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const jobs = await getJobApplications();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <DashboardHeader userName={session.user.name} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
          <StatsCards jobs={jobs} />
          <JobsDataTable data={jobs} />
        </div>
      </main>

      <footer className="border-t py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Job Hunt Tracker &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}
