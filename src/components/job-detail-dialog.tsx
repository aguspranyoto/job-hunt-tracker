"use client";

import type { JobApplication } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Building2,
  MapPin,
  DollarSign,
  ExternalLink,
  Calendar,
  Clock,
} from "lucide-react";
import { getStatusColor } from "@/lib/status-colors";

interface JobDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobApplication | null;
}

export function JobDetailDialog({
  open,
  onOpenChange,
  job,
}: JobDetailDialogProps) {
  if (!job) return null;

  const formatDate = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (date: string | Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl leading-tight">
                {job.jobPosition}
              </DialogTitle>
              <div className="mt-1.5 flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">{job.companyName}</span>
              </div>
            </div>
            <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-5">
          {/* Meta info grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {job.companyLocation && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{job.companyLocation}</span>
              </div>
            )}
            {job.salaryRange && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>{job.salaryRange}</span>
              </div>
            )}
            {job.dateApplied && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Applied: {formatDate(job.dateApplied)}</span>
              </div>
            )}
            {job.lastStatusUpdate && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Updated: {formatDateTime(job.lastStatusUpdate)}</span>
              </div>
            )}
          </div>

          {job.jobUrl && (
            <a
              href={job.jobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <ExternalLink className="h-4 w-4" />
              View Job Posting
            </a>
          )}

          {job.benefits && (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Benefits
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/50 p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {job.benefits}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}

          {job.notes && (
            <>
              <Separator />
              <div>
                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Notes
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg bg-muted/50 p-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {job.notes}
                  </ReactMarkdown>
                </div>
              </div>
            </>
          )}

          <Separator />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Created: {formatDateTime(job.createdAt)}</span>
            <span>Updated: {formatDateTime(job.updatedAt)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
