"use client";

import { useEffect, useState } from "react";

interface SlideTransitionProps {
  children: React.ReactNode;
  slideKey: number;
  direction: "left" | "right";
}

export function SlideTransition({ children, slideKey, direction }: SlideTransitionProps) {
  const [visible, setVisible] = useState(false);
  const [prevSlideKey, setPrevSlideKey] = useState(slideKey);

  // Reset visibility during render when the slide changes (React's documented
  // "adjust state when a prop changes" pattern) instead of setState in the effect.
  if (prevSlideKey !== slideKey) {
    setPrevSlideKey(slideKey);
    setVisible(false);
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, [slideKey]);

  const translate = direction === "right" ? "translate-x-8" : "-translate-x-8";

  return (
    <div
      className={`w-full transition-all duration-500 ease-out ${
        visible ? "translate-x-0 opacity-100" : `${translate} opacity-0`
      }`}
    >
      {children}
    </div>
  );
}
