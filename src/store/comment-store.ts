import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

export interface Comment {
  id: string;
  pagePath: string;
  markerX: number;
  markerY: number;
  content: string;
  authorName: string;
  authorEmail?: string;
  isResolved: boolean;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CommentStore {
  comments: Comment[];
  isLoaded: boolean;
  currentPage: string | null;
  loadComments: (pagePath: string) => Promise<void>;
  addComment: (data: {
    pagePath: string;
    markerX: number;
    markerY: number;
    content: string;
    authorName: string;
    authorEmail?: string;
    parentId?: string;
  }) => Promise<string>;
  resolveComment: (id: string) => Promise<void>;
  unresolveComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  getCommentsByPage: (pagePath: string) => Comment[];
  getReplies: (parentId: string) => Comment[];
}

function toSnakeComment(comment: Partial<Comment>) {
  return {
    ...(comment.pagePath !== undefined && { page_path: comment.pagePath }),
    ...(comment.markerX !== undefined && { marker_x: comment.markerX }),
    ...(comment.markerY !== undefined && { marker_y: comment.markerY }),
    ...(comment.content !== undefined && { content: comment.content }),
    ...(comment.authorName !== undefined && { author_name: comment.authorName }),
    ...(comment.authorEmail !== undefined && { author_email: comment.authorEmail }),
    ...(comment.isResolved !== undefined && { is_resolved: comment.isResolved }),
    ...(comment.parentId !== undefined && { parent_id: comment.parentId }),
  };
}

function fromSnakeComment(row: Record<string, unknown>): Comment {
  return {
    id: row.id as string,
    pagePath: row.page_path as string,
    markerX: Number(row.marker_x) || 0,
    markerY: Number(row.marker_y) || 0,
    content: row.content as string,
    authorName: row.author_name as string,
    authorEmail: row.author_email as string | undefined,
    isResolved: row.is_resolved as boolean,
    parentId: row.parent_id as string | null | undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function sortComments(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => {
    // Unresolved first
    if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
    // Then by created_at ascending
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}

export const useCommentStore = create<CommentStore>()((set, get) => ({
  comments: [],
  isLoaded: false,
  currentPage: null,

  loadComments: async (pagePath: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("page_comments")
      .select("*")
      .eq("page_path", pagePath)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Failed to load comments:", error.message);
      return;
    }

    const comments = sortComments((data || []).map(fromSnakeComment));
    set({ comments, isLoaded: true, currentPage: pagePath });
  },

  addComment: async (data) => {
    const supabase = createClient();

    const { data: row, error } = await supabase
      .from("page_comments")
      .insert({
        page_path: data.pagePath,
        marker_x: data.markerX,
        marker_y: data.markerY,
        content: data.content,
        author_name: data.authorName,
        author_email: data.authorEmail,
        parent_id: data.parentId,
      })
      .select()
      .single();

    if (error) throw error;
    const comment = fromSnakeComment(row);
    set((state) => ({ comments: sortComments([...state.comments, comment]) }));
    return comment.id;
  },

  resolveComment: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_comments")
      .update({ is_resolved: true })
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      comments: sortComments(
        state.comments.map((c) =>
          c.id === id ? { ...c, isResolved: true, updatedAt: new Date().toISOString() } : c
        )
      ),
    }));
  },

  unresolveComment: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_comments")
      .update({ is_resolved: false })
      .eq("id", id);

    if (error) throw error;
    set((state) => ({
      comments: sortComments(
        state.comments.map((c) =>
          c.id === id ? { ...c, isResolved: false, updatedAt: new Date().toISOString() } : c
        )
      ),
    }));
  },

  deleteComment: async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("page_comments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    // Remove the comment and any replies (cascade happens in DB, mirror locally)
    set((state) => ({
      comments: state.comments.filter((c) => c.id !== id && c.parentId !== id),
    }));
  },

  getCommentsByPage: (pagePath: string) => {
    return get().comments.filter((c) => c.pagePath === pagePath && !c.parentId);
  },

  getReplies: (parentId: string) => {
    return get().comments.filter((c) => c.parentId === parentId);
  },
}));
