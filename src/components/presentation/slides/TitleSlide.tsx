import { Slide } from "../Slide";

export function TitleSlide() {
  return (
    <Slide>
      <div className="flex flex-col items-center gap-8 py-8 text-center">
        {/* Logo */}
        <div className="text-5xl font-bold tracking-tight">
          <span className="text-white">Table</span>
          <span className="text-brand-green">X</span>
        </div>

        {/* Title */}
        <h1 className="max-w-3xl text-5xl font-bold leading-tight">
          <span className="gradient-text">Digital Transformation</span>
          <br />
          <span className="text-white/80">& Website Redesign</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-lg text-white/40">
          A vision for modernizing TableX&apos;s digital presence, quoting workflow, and customer experience
        </p>

        {/* Date */}
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-white/30">
          February 2026
        </div>
      </div>
    </Slide>
  );
}
