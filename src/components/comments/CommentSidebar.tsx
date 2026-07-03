"use client";

import { useState } from "react";
import { X, CheckCircle2, Trash2, Reply, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommentStore, type Comment } from "@/store/comment-store";
import { CommentInput } from "./CommentInput";

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMon = Math.floor(diffDay / 30);
  return `${diffMon}mo ago`;
}

interface CommentSidebarProps {
  open: boolean;
  onClose: () => void;
  selectedCommentId: string | null;
  onSelectComment: (id: string | null) => void;
  pendingMarker: { x: number; y: number } | null;
  onClearPending: () => void;
  pagePath: string;
}

export function CommentSidebar({
  open,
  onClose,
  selectedCommentId,
  onSelectComment,
  pendingMarker,
  onClearPending,
  pagePath,
}: CommentSidebarProps) {
  const { comments, resolveComment, unresolveComment, deleteComment, getReplies } =
    useCommentStore();
  const [showResolved, setShowResolved] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const topLevel = comments.filter((c) => !c.parentId);
  const filtered = showResolved ? topLevel : topLevel.filter((c) => !c.isResolved);
  const unresolvedCount = topLevel.filter((c) => !c.isResolved).length;

  return (
    <div
      className={cn(
        "fixed right-0 top-0 z-50 flex h-full w-[380px] flex-col border-l border-slate-200 bg-white shadow-xl transition-transform duration-300",
        open ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Comments</h2>
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[11px] font-medium text-slate-600">
            {unresolvedCount}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close comments"
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-slate-300 text-brand-green focus:ring-brand-green"
          />
          Show resolved
        </label>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Pending marker input */}
        {pendingMarker && (
          <div className="mb-3">
            <CommentInput
              pagePath={pagePath}
              markerX={pendingMarker.x}
              markerY={pendingMarker.y}
              onSubmit={onClearPending}
              onCancel={onClearPending}
            />
          </div>
        )}

        {filtered.length === 0 && !pendingMarker && (
          <p className="py-8 text-center text-sm text-slate-400">
            No comments yet. Click on the page to add one.
          </p>
        )}

        {filtered.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isSelected={selectedCommentId === comment.id}
            onSelect={() => onSelectComment(comment.id)}
            onResolve={() => resolveComment(comment.id)}
            onUnresolve={() => unresolveComment(comment.id)}
            onDelete={() => deleteComment(comment.id)}
            replies={getReplies(comment.id)}
            replyingTo={replyingTo}
            onStartReply={() => setReplyingTo(comment.id)}
            onCancelReply={() => setReplyingTo(null)}
            onReplySubmitted={() => setReplyingTo(null)}
            onDeleteReply={(id) => deleteComment(id)}
            pagePath={pagePath}
          />
        ))}
      </div>
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  isSelected: boolean;
  onSelect: () => void;
  onResolve: () => void;
  onUnresolve: () => void;
  onDelete: () => void;
  replies: Comment[];
  replyingTo: string | null;
  onStartReply: () => void;
  onCancelReply: () => void;
  onReplySubmitted: () => void;
  onDeleteReply: (id: string) => void;
  pagePath: string;
}

function CommentCard({
  comment,
  isSelected,
  onSelect,
  onResolve,
  onUnresolve,
  onDelete,
  replies,
  replyingTo,
  onStartReply,
  onCancelReply,
  onReplySubmitted,
  onDeleteReply,
  pagePath,
}: CommentCardProps) {
  const isReplying = replyingTo === comment.id;

  return (
    <div className="mb-3">
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onSelect();
        }}
        className={cn(
          "rounded-lg border p-3 transition-colors",
          isSelected
            ? "border-blue-200 bg-blue-50"
            : "border-slate-100 bg-white hover:border-slate-200"
        )}
      >
        {/* Author row */}
        <div className="mb-1.5 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-green text-[10px] font-bold text-white">
            {comment.authorName.charAt(0).toUpperCase()}
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {comment.authorName}
          </span>
          <span className="ml-auto text-xs text-slate-400">
            {relativeTime(comment.createdAt)}
          </span>
        </div>

        {/* Content */}
        <p className="mb-2 text-sm text-slate-700">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {comment.isResolved ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onUnresolve();
              }}
              aria-label="Unresolve comment"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reopen
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onResolve();
              }}
              aria-label="Resolve comment"
              className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-green-50 hover:text-green-600"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartReply();
            }}
            aria-label="Reply to comment"
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-600"
          >
            <Reply className="h-3.5 w-3.5" />
            Reply
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            aria-label="Delete comment"
            className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-red-400 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Replies */}
      {replies.length > 0 && (
        <div className="ml-4 mt-1 border-l-2 border-slate-100 pl-3">
          {replies.map((reply) => (
            <div key={reply.id} className="mb-2 rounded-md bg-slate-50 p-2.5">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-[9px] font-bold text-white">
                  {reply.authorName.charAt(0).toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-slate-800">
                  {reply.authorName}
                </span>
                <span className="ml-auto text-[10px] text-slate-400">
                  {relativeTime(reply.createdAt)}
                </span>
              </div>
              <p className="text-xs text-slate-600">{reply.content}</p>
              <div className="mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onDeleteReply(reply.id)}
                  aria-label="Delete reply"
                  className="rounded p-0.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply input */}
      {isReplying && (
        <div className="ml-4 mt-2 pl-3">
          <CommentInput
            pagePath={pagePath}
            markerX={comment.markerX}
            markerY={comment.markerY}
            parentId={comment.id}
            onSubmit={onReplySubmitted}
            onCancel={onCancelReply}
          />
        </div>
      )}
    </div>
  );
}
