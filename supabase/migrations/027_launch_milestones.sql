-- 027_launch_milestones.sql — the "Launch Timeline" workstream milestones.
-- One row = one milestone on the master launch Gantt. The four workstreams
-- (lanes), owner categories, and statuses are STATIC config in code
-- (src/data/launch-timeline.ts); only the milestones are user-editable and
-- live here. RLS + realtime mirror 024 / 026.

CREATE TABLE launch_milestones (
  id          text PRIMARY KEY,                    -- seeded (w1..v11) or nanoid(10)
  lane        text NOT NULL CHECK (lane IN ('web','lookbook','spec','video')),
  title       text NOT NULL,
  owner       text NOT NULL CHECK (owner IN ('tablex','clearph','dev','vendor')),
  start_date  date NOT NULL,
  end_date    date NOT NULL,                       -- inclusive
  status      text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo','active','done','blocked')),
  note        text,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX launch_milestones_lane_idx    ON launch_milestones (lane);
CREATE INDEX launch_milestones_status_idx  ON launch_milestones (status);
CREATE INDEX launch_milestones_start_idx   ON launch_milestones (start_date);

-- Reuse the conditional touch_updated_at trigger function (migration 015).
CREATE TRIGGER launch_milestones_touch_updated_at
  BEFORE UPDATE ON launch_milestones
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- ============================================================
-- RLS — mirrors 024 / 026 (read/write = proposal access, delete = admin)
-- ============================================================
ALTER TABLE launch_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "launch_milestones: select for proposal users"
  ON launch_milestones FOR SELECT TO authenticated
  USING (public.can_access_proposal() = true);
CREATE POLICY "launch_milestones: insert for proposal users"
  ON launch_milestones FOR INSERT TO authenticated
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "launch_milestones: update for proposal users"
  ON launch_milestones FOR UPDATE TO authenticated
  USING (public.can_access_proposal() = true)
  WITH CHECK (public.can_access_proposal() = true);
CREATE POLICY "launch_milestones: admin delete only"
  ON launch_milestones FOR DELETE TO authenticated
  USING (public.get_user_role() = 'admin');

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE launch_milestones;

-- ============================================================
-- Seed — 41 starter milestones (dates are estimates; team owns the real ones).
-- Idempotent: re-running does not clobber edited rows.
-- ============================================================
INSERT INTO launch_milestones (id, lane, title, owner, start_date, end_date, status, note, sort_order) VALUES
  ('w1','web','Apply 7/09 rulings + reconcile quote desk','dev','2026-07-10','2026-07-11','active','Ship the meeting rulings across the site; verify the quote-desk cloud run.',1),
  ('w2','web','TableX: rep roster + dealer list','tablex','2026-07-10','2026-07-14','todo','Names, territories, contacts + dealer locations. Feeds the locator.',2),
  ('w3','web','Final photography (coverage gaps)','tablex','2026-07-10','2026-07-15','todo','Caleb — outdoor scenes, Elite, Artisan/Justice/Puddle colorblocks, Revel in-use.',3),
  ('w4','web','Brian: draft About copy + Made-in-America page','tablex','2026-07-11','2026-07-18','todo','Customizability, fast turns, easy to work with. MiA details page replaces the killed mfg page.',4),
  ('w5','web','Imagery swap into site','clearph','2026-07-15','2026-07-17','todo',NULL,5),
  ('w6','web','Build About + MiA details page','dev','2026-07-18','2026-07-22','todo',NULL,6),
  ('w7','web','Dealer locator (map) build','dev','2026-07-16','2026-07-21','todo','Blocked until rep/dealer data lands.',7),
  ('w8','web','Xero integration (green-lit)','dev','2026-07-14','2026-07-31','todo','Target Aug 1. Brian to confirm remaining tasks with the integrator by EOW.',8),
  ('w9','web','CRM / marketing training (admin · dealer · rep)','clearph','2026-07-28','2026-08-01','todo',NULL,9),
  ('w10','web','Brian final walkthrough + sign-off','tablex','2026-08-03','2026-08-06','todo',NULL,10),
  ('w11','web','Launch cutover (DNS · site-live flag · auth)','dev','2026-08-07','2026-08-08','todo','Alt: Sep 1 if launch must ship with the video. Don''t touch MX/M365 records.',11),
  ('l1','lookbook','TableX: supply remaining images + copy','tablex','2026-07-10','2026-07-18','todo','All product images + section copy for the full ~80 pages.',12),
  ('l2','lookbook','Design & layout (~80 pp)','clearph','2026-06-15','2026-07-25','active','In progress — R1 V4, 31 pp laid out (Kayla).',13),
  ('l3','lookbook','Internal Clear pH review','clearph','2026-07-25','2026-07-28','todo',NULL,14),
  ('l4','lookbook','TableX review — round 1','tablex','2026-07-28','2026-08-01','todo',NULL,15),
  ('l5','lookbook','Edits / revisions','clearph','2026-08-01','2026-08-06','todo',NULL,16),
  ('l6','lookbook','Final approval / sign-off','tablex','2026-08-06','2026-08-08','todo',NULL,17),
  ('l7','lookbook','Prepress / print-ready files','clearph','2026-08-08','2026-08-11','todo',NULL,18),
  ('l8','lookbook','Digital PDF for site (versionable)','clearph','2026-08-08','2026-08-11','todo','7/09 decision: lookbook is also a downloadable, versionable PDF.',19),
  ('l9','lookbook','Printer hard proof + approve','vendor','2026-08-11','2026-08-14','todo',NULL,20),
  ('l10','lookbook','Print + perfect-bind (≥3 wk lead)','vendor','2026-08-14','2026-09-04','todo','Bindery usually sets the delivery date. Confirm exact lead time with the printer.',21),
  ('l11','lookbook','Ship / deliver','vendor','2026-09-04','2026-09-08','todo',NULL,22),
  ('s1','spec','Mark: finalize pricing + technical specs','tablex','2026-07-10','2026-07-18','todo','Data hand-off. Ties to the ''review price lists'' action item.',23),
  ('s2','spec','Design & layout','clearph','2026-07-14','2026-07-25','active','In progress — R1 V1 (5-pg draft).',24),
  ('s3','spec','Internal Clear pH review','clearph','2026-07-25','2026-07-28','todo',NULL,25),
  ('s4','spec','TableX review (Mark verifies pricing accuracy)','tablex','2026-07-28','2026-08-01','todo',NULL,26),
  ('s5','spec','Edits','clearph','2026-08-01','2026-08-05','todo',NULL,27),
  ('s6','spec','Final approval','tablex','2026-08-05','2026-08-07','todo',NULL,28),
  ('s7','spec','Digital PDF publish (primary)','clearph','2026-08-07','2026-08-08','todo','Primary format per 7/09 (versionable downloads).',29),
  ('s8','spec','Optional print run','vendor','2026-08-08','2026-08-29','todo','Only if physical leave-behinds are wanted.',30),
  ('v1','video','Creative brief / concept + treatment','clearph','2026-07-14','2026-07-21','todo',NULL,31),
  ('v2','video','Script','clearph','2026-07-21','2026-07-28','todo','Brian to approve.',32),
  ('v3','video','Storyboard + shot list','clearph','2026-07-28','2026-08-04','todo',NULL,33),
  ('v4','video','Secure videographer / production vendor','dev','2026-07-21','2026-07-31','todo','Parallel with pre-pro. Get quotes early.',34),
  ('v5','video','Location scout + secure','clearph','2026-07-28','2026-08-07','todo',NULL,35),
  ('v6','video','Static assets / motion-graphics prep','clearph','2026-08-04','2026-08-14','todo',NULL,36),
  ('v7','video','Shoot','vendor','2026-08-17','2026-08-19','todo',NULL,37),
  ('v8','video','Edit — rough cut','vendor','2026-08-19','2026-08-28','todo',NULL,38),
  ('v9','video','Review + revisions','tablex','2026-08-28','2026-09-04','todo',NULL,39),
  ('v10','video','Color / sound / music / graphics','vendor','2026-09-04','2026-09-11','todo',NULL,40),
  ('v11','video','Final delivery','vendor','2026-09-11','2026-09-15','todo','Lands mid-Sept — after an August site launch. Only gates launch if launch-with-video is required.',41)
ON CONFLICT (id) DO NOTHING;
