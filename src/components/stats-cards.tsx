import type { JobApplication, JobStatus } from "@/db/schema";
import { JOB_STATUSES } from "@/lib/validations";
import { getStatusDotColor } from "@/lib/status-colors";
import {
  Briefcase,
  TrendingUp,
  Clock,
  CheckCircle2,
} from "lucide-react";

interface StatsCardsProps {
  jobs: JobApplication[];
}

export function StatsCards({ jobs }: StatsCardsProps) {
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) =>
    ["Applied", "Screening", "Interviewing"].includes(j.status)
  ).length;
  const offers = jobs.filter((j) => j.status === "Offer").length;
  const thisWeekJobs = jobs.filter((j) => {
    if (!j.createdAt) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(j.createdAt) > weekAgo;
  }).length;

  const statusCounts: Record<string, number> = {};
  JOB_STATUSES.forEach((s) => {
    statusCounts[s] = jobs.filter((j) => j.status === s).length;
  });

  const stats = [
    {
      label: "Total Applications",
      value: totalJobs,
      icon: Briefcase,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      label: "Active Pipeline",
      value: activeJobs,
      icon: TrendingUp,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-100 dark:bg-purple-900/40",
    },
    {
      label: "This Week",
      value: thisWeekJobs,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/40",
    },
    {
      label: "Offers",
      value: offers,
      icon: CheckCircle2,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/40",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}
              >
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      {totalJobs > 0 && (
        <div className="flex flex-wrap gap-2">
          {JOB_STATUSES.map((status) => {
            const count = statusCounts[status];
            if (count === 0) return null;
            return (
              <div
                key={status}
                className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium shadow-sm"
              >
                <div
                  className={`h-2 w-2 rounded-full ${getStatusDotColor(
                    status as JobStatus
                  )}`}
                />
                {status}: {count}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
