"use client";

import { useState, useEffect } from "react";
import type { CV } from "@/types/cv";
import { getCVs, saveCV, updateCV, deleteCV } from "@/lib/storage";
import { X, Plus, Edit2, Trash2, FileText } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function CVLibraryModal({ onClose }: Props) {
  const [cvs, setCVs] = useState<CV[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null); // null = list, "new" = create
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setCVs(getCVs());
  }, []);

  const refresh = () => setCVs(getCVs());

  const handleNew = () => {
    setEditingId("new");
    setName("");
    setContent("");
  };

  const handleEdit = (cv: CV) => {
    setEditingId(cv.id);
    setName(cv.name);
    setContent(cv.content);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingId === "new") {
      saveCV(name.trim(), content);
    } else if (editingId) {
      updateCV(editingId, { name: name.trim(), content });
    }
    setEditingId(null);
    refresh();
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCV(deleteId);
      setDeleteId(null);
      if (editingId === deleteId) setEditingId(null);
      refresh();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-black/30 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">CV Library</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {editingId === null ? (
          <>
            {cvs.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No saved CVs yet.</p>
                <button
                  onClick={handleNew}
                  className="mt-2 text-primary-600 font-medium hover:underline"
                >
                  Create your first CV
                </button>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {cvs.map((cv) => (
                  <div
                    key={cv.id}
                    className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={16} className="text-gray-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{cv.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {cv.content.slice(0, 80)}{cv.content.length > 80 ? "..." : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => handleEdit(cv)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 rounded transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteId(cv.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              <Plus size={16} />
              New CV
            </button>
          </>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CV Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PM Resume 2026"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CV Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your resume content here..."
                className="w-full h-48 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!name.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                Save CV
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-lg">
            <h3 className="font-semibold text-gray-900">Delete CV?</h3>
            <p className="text-sm text-gray-500 mt-1">This cannot be undone.</p>
            <div className="flex gap-2 mt-4 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
