import type { JobStatus } from "@/db/schema";

const statusColorMap: Record<JobStatus, string> = {
  Bookmarked:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  Applied:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  Screening:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  Interviewing:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  Offer:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  Rejected:
    "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800",
  Ghosted:
    "bg-zinc-100 text-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700",
};

export function getStatusColor(status: JobStatus): string {
  return statusColorMap[status] || "";
}

export function getStatusDotColor(status: JobStatus): string {
  const dotColors: Record<JobStatus, string> = {
    Bookmarked: "bg-blue-500",
    Applied: "bg-indigo-500",
    Screening: "bg-amber-500",
    Interviewing: "bg-purple-500",
    Offer: "bg-emerald-500",
    Rejected: "bg-red-500",
    Ghosted: "bg-zinc-400",
  };
  return dotColors[status] || "bg-zinc-400";
}
