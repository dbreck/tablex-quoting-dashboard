"use client";

import { useState, useEffect, useRef } from "react";
import { useCommentStore } from "@/store/comment-store";

interface CommentInputProps {
  pagePath: string;
  markerX?: number;
  markerY?: number;
  parentId?: string;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CommentInput({
  pagePath,
  markerX,
  markerY,
  parentId,
  onSubmit,
  onCancel,
}: CommentInputProps) {
  const addComment = useCommentStore((s) => s.addComment);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const savedName = localStorage.getItem("comment-author-name") || "";
    const savedEmail = localStorage.getItem("comment-author-email") || "";
    setAuthorName(savedName);
    setAuthorEmail(savedEmail);
  }, []);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;

    setSubmitting(true);
    try {
      localStorage.setItem("comment-author-name", authorName.trim());
      if (authorEmail.trim()) {
        localStorage.setItem("comment-author-email", authorEmail.trim());
      }

      await addComment({
        pagePath,
        markerX: markerX ?? 0,
        markerY: markerY ?? 0,
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim() || undefined,
        parentId,
      });
      onSubmit();
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="mb-2 grid grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Your name *"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          required
          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={authorEmail}
          onChange={(e) => setAuthorEmail(e.target.value)}
          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
        />
      </div>
      <textarea
        ref={textareaRef}
        placeholder="Add a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={2}
        className="mb-2 w-full resize-none rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
      />
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !content.trim() || !authorName.trim()}
          className="rounded-md bg-brand-green px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-green/90 disabled:opacity-50"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>
    </form>
  );
}
