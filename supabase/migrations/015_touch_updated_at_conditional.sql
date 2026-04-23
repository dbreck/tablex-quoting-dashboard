-- 015_touch_updated_at_conditional.sql — let callers pin updated_at explicitly.
--
-- The original touch_updated_at() in 013 unconditionally rewrote updated_at to now().
-- That broke a Monday sync invariant: pulled patches stamp updated_at = syncedAt so
-- the next reconcile sees the row as already in sync. With the unconditional trigger,
-- updated_at landed at now() (> syncedAt), so the next pass re-pushed the same data
-- back to Monday — ping-pong.
--
-- New behavior: only auto-touch when the caller leaves updated_at unchanged from OLD.
-- IS NOT DISTINCT FROM is NULL-safe; both NULL counts as "unchanged".

CREATE OR REPLACE FUNCTION touch_updated_at() RETURNS trigger AS $$
BEGIN
  IF NEW.updated_at IS NOT DISTINCT FROM OLD.updated_at THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
