import { Slide } from "../Slide";
import { StatCard } from "../StatCard";
import { Building2, Users, Network } from "lucide-react";

export function CrmSlide() {
  return (
    <Slide appLink="/quote/crm" linkLabel="Explore the CRM" takeaway="Your entire dealer network — 933 organizations, 13 rep group hierarchies, and every contact — is mapped and linked to quote history. You can finally see who your best customers are.">
      <div className="flex flex-col gap-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white">CRM & Relationships</h2>
          <p className="mt-2 text-white/40">
            Your entire dealer network, mapped and connected
          </p>
        </div>

        <div className="stagger grid grid-cols-3 gap-6">
          <div className="animate-slide-up">
            <StatCard
              value="933"
              label="Organizations"
              icon={<Building2 className="h-6 w-6" />}
              accent
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="457"
              label="Contacts"
              icon={<Users className="h-6 w-6" />}
            />
          </div>
          <div className="animate-slide-up">
            <StatCard
              value="13"
              label="Rep Group Hierarchies"
              icon={<Network className="h-6 w-6" />}
            />
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-lg font-semibold text-white">Dealers</div>
              <div className="text-xs text-white/30">Linked to parent rep groups</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Quote History</div>
              <div className="text-xs text-white/30">Tied to every organization</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-white">Discount Tiers</div>
              <div className="text-xs text-white/30">50/20/10 trade pricing</div>
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}
