export default function PresentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#070d17] text-white">
      {children}
    </div>
  );
}
