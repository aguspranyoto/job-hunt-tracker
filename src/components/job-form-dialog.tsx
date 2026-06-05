"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  jobApplicationSchema,
  type JobApplicationFormData,
  JOB_STATUSES,
} from "@/lib/validations";
import type { JobApplication } from "@/db/schema";
import {
  createJobApplication,
  updateJobApplication,
} from "@/app/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface JobFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job?: JobApplication | null;
  onSuccess?: () => void;
}

export function JobFormDialog({
  open,
  onOpenChange,
  job,
  onSuccess,
}: JobFormDialogProps) {
  const isEditing = !!job;
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<JobApplicationFormData>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: {
      companyName: job?.companyName || "",
      jobPosition: job?.jobPosition || "",
      status: job?.status || "Bookmarked",
      companyLocation: job?.companyLocation || "",
      salaryRange: job?.salaryRange || "",
      jobUrl: job?.jobUrl || "",
      benefits: job?.benefits || "",
      notes: job?.notes || "",
      dateApplied: job?.dateApplied
        ? typeof job.dateApplied === "string"
          ? job.dateApplied
          : new Date(job.dateApplied).toISOString().split("T")[0]
        : "",
    },
  });

  const onSubmit = async (data: JobApplicationFormData) => {
    setSubmitting(true);
    try {
      const result = isEditing
        ? await updateJobApplication(job!.id, data, job!.status)
        : await createJobApplication(data);

      if (result.success) {
        toast.success(result.message);
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            form.setError(field as keyof JobApplicationFormData, {
              message: errors[0],
            });
          });
        }
        toast.error(result.message);
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Job Application" : "New Job Application"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of your job application."
              : "Add a new job application to track."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="companyName"
                placeholder="Google, Meta, etc."
                {...form.register("companyName")}
              />
              {form.formState.errors.companyName && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.companyName.message}
                </p>
              )}
            </div>

            {/* Job Position */}
            <div className="space-y-2">
              <Label htmlFor="jobPosition">
                Job Position <span className="text-destructive">*</span>
              </Label>
              <Input
                id="jobPosition"
                placeholder="Frontend Developer"
                {...form.register("jobPosition")}
              />
              {form.formState.errors.jobPosition && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.jobPosition.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) =>
                  value && form.setValue("status", value as JobApplicationFormData["status"])
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {JOB_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.status.message}
                </p>
              )}
            </div>

            {/* Company Location */}
            <div className="space-y-2">
              <Label htmlFor="companyLocation">Location</Label>
              <Input
                id="companyLocation"
                placeholder="Remote, Hybrid, Jakarta"
                {...form.register("companyLocation")}
              />
            </div>

            {/* Salary Range */}
            <div className="space-y-2">
              <Label htmlFor="salaryRange">Salary Range</Label>
              <Input
                id="salaryRange"
                placeholder="$80k - $120k"
                {...form.register("salaryRange")}
              />
            </div>

            {/* Date Applied */}
            <div className="space-y-2">
              <Label htmlFor="dateApplied">Date Applied</Label>
              <Input
                id="dateApplied"
                type="date"
                {...form.register("dateApplied")}
              />
            </div>
          </div>

          {/* Job URL */}
          <div className="space-y-2">
            <Label htmlFor="jobUrl">Job Posting URL</Label>
            <Input
              id="jobUrl"
              type="url"
              placeholder="https://careers.company.com/job/..."
              {...form.register("jobUrl")}
            />
            {form.formState.errors.jobUrl && (
              <p className="text-xs text-destructive">
                {form.formState.errors.jobUrl.message}
              </p>
            )}
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (Markdown supported)</Label>
            <Textarea
              id="benefits"
              placeholder="- Health insurance&#10;- Remote work&#10;- Stock options"
              rows={4}
              {...form.register("benefits")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Markdown supported)</Label>
            <Textarea
              id="notes"
              placeholder="Interview notes, feedback, thoughts..."
              rows={4}
              {...form.register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : isEditing ? (
                "Update Application"
              ) : (
                "Create Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
