"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Job } from "@/types";
import { formatDate, getStatusColor, getAtsColor } from "@/lib/utils";
import { getNextAction } from "@/lib/getNextAction";
import { MapPin, Calendar, Edit2, Trash2, ArrowRight, ChevronDown, ExternalLink } from "lucide-react";
import JobForm from "./JobForm";
import { useT } from "@/lib/i18n";

interface Props {
  job: Job;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function JobCard({ job, isExpanded, onToggle }: Props) {
  const router = useRouter();
  const deleteJob = useStore((s) => s.deleteJob);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showFullJd, setShowFullJd] = useState(false);
  const t = useT();

  const nextAction = getNextAction(job);

  const handleDelete = () => {
    deleteJob(job.id);
    setShowDelete(false);
  };

  const handleGo = () => {
    if (nextAction.path) {
      router.push(nextAction.path);
    } else if (nextAction.label === "Apply Now") {
      alert("Apply tracking is coming soon. For now, update the status manually after applying.");
    }
  };

  return (
    <>
      <div
        onClick={onToggle}
        className={`bg-white rounded-xl border p-4 transition-all cursor-pointer ${
          isExpanded ? "border-primary-200 shadow-sm" : "border-gray-100 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-gray-900 truncate">{job.position}</h3>
            <p className="text-sm text-gray-600 mt-0.5">{job.company}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {job.location}
                </span>
              )}
              {job.appliedDate && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} /> {formatDate(job.appliedDate)}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-2 shrink-0">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getAtsColor(job.atsScore)}`}>
              {job.atsScore !== null ? `ATS ${job.atsScore}%` : t("Not analyzed")}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <button
            onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-primary-600 transition-colors"
          >
            <Edit2 size={12} /> {t("Edit")}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setShowDelete(true); }}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={12} /> {t("Delete")}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleGo(); }}
            className="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 ml-auto transition-colors"
          >
            {t("Next:")} {nextAction.label}
            <ArrowRight size={12} />
          </button>
        </div>

        {/* Expanded Detail */}
        {isExpanded && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-4 pt-4 border-t border-gray-100"
          >
            <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {job.location && (
                <Detail label={t("Location")} value={job.location} />
              )}
              {job.salary && (
                <Detail label={t("Salary")} value={job.salary} />
              )}
              {job.jobUrl && (
                <div>
                  <span className="text-xs text-gray-400">{t("Job URL")}</span>
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:underline truncate"
                  >
                    {job.source || "Link"}
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
              {job.appliedDate && (
                <Detail label={t("Applied Date")} value={formatDate(job.appliedDate)} />
              )}
              {job.followUpDate && (
                <Detail label={t("Follow-up Date")} value={formatDate(job.followUpDate)} />
              )}
              {job.deadlineDate && (
                <Detail label={t("Deadline Date")} value={formatDate(job.deadlineDate)} />
              )}
              {job.source && (
                <Detail label={t("Source")} value={job.source} />
              )}
            </div>

            {job.notes && (
              <div className="mt-3">
                <span className="text-xs text-gray-400">{t("Notes")}</span>
                <p className="text-sm text-gray-600 mt-0.5">{job.notes}</p>
              </div>
            )}

            {job.jobDescription && (
              <div className="mt-3">
                <span className="text-xs text-gray-400">{t("Job Description")}</span>
                <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap">
                  {showFullJd || job.jobDescription.length <= 300
                    ? job.jobDescription
                    : job.jobDescription.slice(0, 300) + "..."}
                </p>
                {job.jobDescription.length > 300 && (
                  <button
                    onClick={() => setShowFullJd(!showFullJd)}
                    className="text-xs text-primary-600 hover:underline mt-1"
                  >
                    {showFullJd ? t("Show less") : t("Show more")}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showEdit && <JobForm job={job} onClose={() => setShowEdit(false)} />}

      {/* Delete Confirm */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="font-semibold text-gray-900">{t("Delete Job?")}</h3>
            <p className="text-sm text-gray-500 mt-1">
              {t("Delete Job?")} {job.position} at {job.company}?
            </p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setShowDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {t("Cancel")}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-400">{label}</span>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
