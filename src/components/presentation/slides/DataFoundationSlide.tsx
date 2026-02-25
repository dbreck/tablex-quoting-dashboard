import { Slide } from "../Slide";
import { StatCard } from "../StatCard";
import { FileText, Box, Globe, Boxes } from "lucide-react";

export function DataFoundationSlide() {
  return (
    <Slide appLink="/queue" linkLabel="See the analytics">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">The Data Foundation</h2>
          <p className="mt-2 text-white/40">
            We&apos;ve already digitized your entire operation
          </p>
        </div>

        <div className="stagger grid grid-cols-4 gap-5">
          <div className="animate-slide-up">
            <StatCard
              value="3,595"
              label="Historical Quotes"
              icon={<FileText className="h-6 w-6" />}
              accent
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="6,098"
              label="Product SKUs"
              icon={<Box className="h-6 w-6" />}
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="1,150"
              label="Web Requests"
              icon={<Globe className="h-6 w-6" />}
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="2,920"
              label="3D Models"
              icon={<Boxes className="h-6 w-6" />}
              accent
            />
          </div>
        </div>

        <p className="text-center text-sm text-white/30">
          Every quote, SKU, web request, and 3D model from the past 3 years — already loaded and searchable
        </p>
      </div>
    </Slide>
  );
}
