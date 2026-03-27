import { Slide } from "../Slide";

export function ConfiguratorSlide() {
  return (
    <Slide appLink="/configurator" linkLabel="Try the Spec Studio" takeaway="Dealers and internal staff pick a base style, then customize freely in real-time 3D — eliminating guesswork and reducing quoting errors. Collections offer curated groupings for A&D.">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">Spec Studio + Collections</h2>
          <p className="mt-2 text-white/40">
            Interactive table builder with real-time 3D preview &amp; curated design groupings
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Feature list */}
          <div className="flex flex-col gap-5">
            {[
              { num: "11", label: "Table series with full 3D models" },
              { num: "2,920", label: "Unique configurations visualized" },
              { num: "31", label: "Powder coat finishes with PBR textures" },
              { num: "8", label: "Edge types with material swapping" },
            ].map((item) => (
              <div key={item.label} className="flex items-baseline gap-4">
                <span className="text-2xl font-bold text-[#ff6b6b]">{item.num}</span>
                <span className="text-sm text-white/60">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Visual placeholder */}
          <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="text-6xl">🪑</div>
              <div className="text-sm text-white/30">
                Live 3D preview with real-time
                <br />
                material & finish changes
              </div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
