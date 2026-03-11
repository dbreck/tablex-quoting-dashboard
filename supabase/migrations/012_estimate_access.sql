-- Add estimate access flag to profiles (off by default)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_access_estimate boolean NOT NULL DEFAULT false;

-- Turn it on for Danny
UPDATE profiles SET can_access_estimate = true WHERE email = 'danny@clearph.com';
