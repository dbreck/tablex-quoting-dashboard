import Image from "next/image";
import { Slide } from "../Slide";

export function TitleSlide() {
  return (
    <Slide>
      <div className="flex flex-col items-center gap-8 py-8 text-center">
        {/* TableX Logo */}
        <Image
          src="/tablex-logomark.svg"
          alt="TableX"
          width={120}
          height={123}
          priority
        />

        {/* Title */}
        <h1 className="max-w-3xl text-5xl font-bold leading-tight">
          <span className="bg-gradient-to-r from-[#ff6b6b] to-[#ff9a76] bg-clip-text text-transparent">Digital Transformation</span>
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

        {/* Presented by ClearPH */}
        <div className="flex items-center gap-3 pt-4">
          <span className="text-xs text-white/30">Presented by</span>
          <Image
            src="/clearph-logo-wt.svg"
            alt="ClearPH"
            width={100}
            height={46}
          />
        </div>
      </div>
    </Slide>
  );
}
