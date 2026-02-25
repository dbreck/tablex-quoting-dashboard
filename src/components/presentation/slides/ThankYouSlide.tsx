import { Slide } from "../Slide";

export function ThankYouSlide() {
  return (
    <Slide>
      <div className="flex flex-col items-center gap-10 py-8 text-center">
        {/* Logo */}
        <div className="text-5xl font-bold tracking-tight">
          <span className="text-white">Table</span>
          <span className="text-brand-green">X</span>
          <span className="mx-3 text-white/20">&times;</span>
          <span className="text-white/60">ClearPH</span>
        </div>

        <h2 className="text-5xl font-bold text-white">Thank You</h2>

        <p className="max-w-md text-lg text-white/40">
          Let&apos;s build something great together.
        </p>

        <div className="flex flex-col items-center gap-2">
          <div className="text-lg font-semibold text-white">Danny Breckenridge</div>
          <div className="text-sm text-white/40">ClearPH Creative</div>
          <div className="mt-1 text-sm text-brand-green">danny@clearph.com</div>
        </div>
      </div>
    </Slide>
  );
}
