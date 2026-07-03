"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { useCommentStore } from "@/store/comment-store";
import { CommentMarker } from "./CommentMarker";
import { CommentSidebar } from "./CommentSidebar";
import { CommentToggle } from "./CommentToggle";

interface CommentContextValue {
  commentMode: boolean;
  setCommentMode: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  selectedCommentId: string | null;
  setSelectedCommentId: (id: string | null) => void;
  pendingMarker: { x: number; y: number } | null;
  setPendingMarker: (m: { x: number; y: number } | null) => void;
}

const CommentContext = createContext<CommentContextValue | null>(null);

export function useComments() {
  const ctx = useContext(CommentContext);
  if (!ctx) throw new Error("useComments must be used within CommentProvider");
  return ctx;
}

const INTERACTIVE_SELECTORS = [
  "button",
  "a",
  "input",
  "select",
  "textarea",
  '[role="tab"]',
  '[role="button"]',
  "[data-radix-collection-item]",
];

function isInteractive(el: HTMLElement): boolean {
  return INTERACTIVE_SELECTORS.some(
    (sel) => el.matches(sel) || el.closest(sel) !== null
  );
}

const CONTAINER_SELECTOR = "[data-comment-container]";

// Hydration guard: false on the server / hydration render, true afterwards.
const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function CommentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const containerRef = useRef<HTMLElement | null>(null);
  // Client-only flag without a setState-in-effect: false during SSR/hydration,
  // true once React resolves the client snapshot (same visible timing as the
  // old `setMounted(true)` mount effect).
  const mounted = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  // Routes that iframe untrusted content (wireframes) — the dashboard's
  // overlay marker system can't reach inside an iframe, so suppress the
  // floating UI there. Each iframe brings its own commenting.
  const suppressOverlay = pathname.startsWith("/wireframes");

  const [commentMode, setCommentModeState] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(
    null
  );
  const [pendingMarker, setPendingMarker] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Leaving comment mode also clears the pending marker and selection.
  // Every commentMode change flows through this setter (internal callers and
  // context consumers), so the clear happens at event time instead of in a
  // state-sync effect.
  const setCommentMode = useCallback((v: boolean) => {
    setCommentModeState(v);
    if (!v) {
      setPendingMarker(null);
      setSelectedCommentId(null);
    }
  }, []);

  useEffect(() => {
    containerRef.current = document.querySelector(
      CONTAINER_SELECTOR
    ) as HTMLElement | null;
  }, []);

  const loadComments = useCommentStore((s) => s.loadComments);
  const comments = useCommentStore((s) => s.comments);

  // Load comments when page changes
  useEffect(() => {
    if (mounted) {
      loadComments(pathname).catch(() => {
        /* supabase may not be reachable */
      });
    }
  }, [pathname, loadComments, mounted]);

  // Toggle crosshair cursor on the container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.style.cursor = commentMode ? "crosshair" : "";
    return () => {
      container.style.cursor = "";
    };
  }, [commentMode]);

  // Imperative click listener on the container for placing markers
  useEffect(() => {
    if (!commentMode) return;
    const container = containerRef.current;
    if (!container) return;

    function handleClick(e: MouseEvent) {
      if (isInteractive(e.target as HTMLElement)) return;

      const rect = container!.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setPendingMarker({ x, y });
      setSelectedCommentId(null);
      setSidebarOpen(true);
    }

    container.addEventListener("click", handleClick);
    return () => container.removeEventListener("click", handleClick);
  }, [commentMode]);

  const handleToggle = useCallback(() => {
    const next = !commentMode;
    setCommentMode(next);
    setSidebarOpen(next);
  }, [commentMode, setCommentMode]);

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedCommentId((prev) => (prev === id ? null : id));
    setSidebarOpen(true);
  }, []);

  const topLevelComments = mounted
    ? comments.filter((c) => c.pagePath === pathname && !c.parentId)
    : [];
  const unresolvedCount = topLevelComments.filter(
    (c) => !c.isResolved
  ).length;

  return (
    <CommentContext.Provider
      value={{
        commentMode,
        setCommentMode,
        sidebarOpen,
        setSidebarOpen,
        selectedCommentId,
        setSelectedCommentId,
        pendingMarker,
        setPendingMarker,
      }}
    >
      {children}

      {/* Suppress all overlay UI on routes that iframe their content. */}
      {suppressOverlay ? null : (
      <>
      {/* Markers for existing comments */}
      {commentMode &&
        topLevelComments.map((comment, index) => (
          <CommentMarker
            key={comment.id}
            id={comment.id}
            number={index + 1}
            x={comment.markerX}
            y={comment.markerY}
            isActive={selectedCommentId === comment.id}
            isResolved={comment.isResolved}
            onClick={() => handleMarkerClick(comment.id)}
          />
        ))}

      {/* Pending marker */}
      {commentMode && pendingMarker && (
        <div
          className="absolute z-40 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-brand-green bg-brand-green/20"
          style={{
            left: `${pendingMarker.x}%`,
            top: `${pendingMarker.y}%`,
          }}
        >
          <span className="text-xs font-bold text-brand-green">+</span>
        </div>
      )}

      {/* Sidebar */}
      <CommentSidebar
        open={sidebarOpen}
        onClose={() => {
          setSidebarOpen(false);
          if (!pendingMarker) setCommentMode(false);
        }}
        selectedCommentId={selectedCommentId}
        onSelectComment={setSelectedCommentId}
        pendingMarker={pendingMarker}
        onClearPending={() => setPendingMarker(null)}
        pagePath={pathname}
      />

      {/* Toggle button hidden globally — page-specific comment UIs (wireframes)
          still work via their own controls. */}
      {false && mounted && (
        <CommentToggle
          active={commentMode}
          unresolvedCount={unresolvedCount}
          onToggle={handleToggle}
        />
      )}
      </>
      )}
    </CommentContext.Provider>
  );
}
