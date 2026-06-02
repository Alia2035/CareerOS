"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, Check, FileText } from "lucide-react";
import type { CV } from "@/types/cv";
import { getCVs } from "@/lib/storage";
import { useT } from "@/lib/i18n";

interface Props {
  onSelect: (cv: CV | null) => void;
  selectedCVId: string;
}

export default function CvSelector({ onSelect, selectedCVId }: Props) {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();

  useEffect(() => {
    setCVs(getCVs());
  }, []);

  const handleFocus = () => {
    setCVs(getCVs());
    setOpen(true);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return cvs;
    return cvs.filter((cv) => cv.name.toLowerCase().includes(q));
  }, [cvs, query]);

  const handleSelect = (cv: CV | null) => {
    onSelect(cv);
    setOpen(false);
    setQuery("");
  };

  const selectedCV = cvs.find((c) => c.id === selectedCVId);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {t("Select saved CV")}
      </label>

      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={open ? query : (selectedCV?.name || "")}
          placeholder={t("Search CVs...")}
          onFocus={handleFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onClick={() => {
            if (!open) handleFocus();
          }}
          className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
        />
        {selectedCVId && (
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 ${
              !selectedCVId ? "bg-primary-50 text-primary-700" : "text-gray-600"
            }`}
          >
            <FileText size={14} />
            {t("None / Manual input")}
            {!selectedCVId && <Check size={14} className="ml-auto text-primary-600" />}
          </button>

          {filtered.length === 0 && (
            <p className="px-3 py-3 text-xs text-gray-400 text-center border-t border-gray-50">
              {query ? t("No matching CVs") : t("No saved CVs yet")}
            </p>
          )}

          {filtered.map((cv) => (
            <button
              key={cv.id}
              type="button"
              onClick={() => handleSelect(cv)}
              className={`w-full text-left px-3 py-2.5 hover:bg-gray-50 border-t border-gray-50 ${
                selectedCVId === cv.id ? "bg-primary-50" : ""
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 truncate">{cv.name}</span>
                {selectedCVId === cv.id && (
                  <Check size={14} className="ml-auto text-primary-600 shrink-0" />
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {t("Updated:")} {cv.updatedAt}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
