"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { SlideNav } from "@/components/presentation/SlideNav";
import { SlideTransition } from "@/components/presentation/SlideTransition";
import { TitleSlide } from "@/components/presentation/slides/TitleSlide";
import { ProblemSlide } from "@/components/presentation/slides/ProblemSlide";
import { DataFoundationSlide } from "@/components/presentation/slides/DataFoundationSlide";
import { ConfiguratorSlide } from "@/components/presentation/slides/ConfiguratorSlide";
import { PipelineSlide } from "@/components/presentation/slides/PipelineSlide";
import { CrmSlide } from "@/components/presentation/slides/CrmSlide";
import { AnalyticsSlide } from "@/components/presentation/slides/AnalyticsSlide";
import { FinancialSlide } from "@/components/presentation/slides/FinancialSlide";
import { SageIntegrationSlide } from "@/components/presentation/slides/SageIntegrationSlide";
import { RoadmapSlide } from "@/components/presentation/slides/RoadmapSlide";
import { ThankYouSlide } from "@/components/presentation/slides/ThankYouSlide";

const SLIDES = [
  TitleSlide,
  ProblemSlide,
  DataFoundationSlide,
  ConfiguratorSlide,
  PipelineSlide,
  CrmSlide,
  AnalyticsSlide,
  FinancialSlide,
  SageIntegrationSlide,
  RoadmapSlide,
  ThankYouSlide,
];

// Stable no-op subscription for useSyncExternalStore (the "value" never changes).
const emptySubscribe = () => () => {};

// Restore slide index from sessionStorage (client only; server/hydration render is gated by `ready`).
function restoreSlideIndex(): number {
  if (typeof window === "undefined") return 0;
  const saved = sessionStorage.getItem("present-slide");
  if (saved) {
    const idx = parseInt(saved, 10);
    if (idx >= 0 && idx < SLIDES.length) {
      return idx;
    }
  }
  return 0;
}

export function PresentationClient() {
  const router = useRouter();
  const [current, setCurrent] = useState(restoreSlideIndex);
  const [direction, setDirection] = useState<"left" | "right">("right");
  // false on the server and during hydration, true once mounted on the client —
  // nothing renders until then, so the sessionStorage-restored `current` never
  // causes a hydration mismatch.
  const ready = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Persist current slide to sessionStorage
  useEffect(() => {
    if (ready) {
      sessionStorage.setItem("present-slide", String(current));
    }
  }, [current, ready]);

  const goNext = useCallback(() => {
    setCurrent((c) => {
      if (c < SLIDES.length - 1) {
        setDirection("right");
        return c + 1;
      }
      return c;
    });
  }, []);

  const goPrev = useCallback(() => {
    setCurrent((c) => {
      if (c > 0) {
        setDirection("left");
        return c - 1;
      }
      return c;
    });
  }, []);

  const goTo = useCallback(
    (index: number) => {
      setDirection(index > current ? "right" : "left");
      setCurrent(index);
    },
    [current]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Escape") {
        sessionStorage.removeItem("present-slide");
        router.push("/overview");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, router]);

  // Click zone navigation
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, a")) return;
    const x = e.clientX / window.innerWidth;
    if (x < 0.25) goPrev();
    else if (x > 0.75) goNext();
  };

  if (!ready) return null;

  const CurrentSlide = SLIDES[current];

  return (
    <div className="relative h-screen w-screen overflow-hidden" onClick={handleClick}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -left-[10%] -top-[20%] h-[600px] w-[600px] rounded-full bg-[#ff6b6b]/5 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[5%] h-[500px] w-[500px] rounded-full bg-brand-navy/30 blur-[100px]" />

      {/* Slide content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-8 pb-16">
        <SlideTransition slideKey={current} direction={direction}>
          <CurrentSlide />
        </SlideTransition>
      </div>

      {/* Navigation */}
      <SlideNav
        current={current}
        total={SLIDES.length}
        onNavigate={goTo}
        onPrev={goPrev}
        onNext={goNext}
      />
    </div>
  );
}
