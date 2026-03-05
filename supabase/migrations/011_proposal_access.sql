-- Add proposal access flag to profiles (off by default)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS can_access_proposal boolean NOT NULL DEFAULT false;

-- Turn it on for Danny
UPDATE profiles SET can_access_proposal = true WHERE email = 'danny@clearph.com';
